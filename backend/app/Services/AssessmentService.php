<?php

namespace App\Services;

// File: backend/app/Services/AssessmentService.php

use App\Models\Assessment;
use App\Models\AssessmentAdjustment;
use App\Models\AssessmentInstallment;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssessmentService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function createAssessment(Enrollment $enrollment, array $data): Assessment
    {
        return DB::transaction(function () use ($enrollment, $data) {
            $adjustments = $data['adjustments'] ?? [];
            $totalAmount = $this->computeTotalAmount($data, $adjustments);

            $assessment = Assessment::create([
                'enrollment_id' => $enrollment->id,
                'tuition_amount' => $this->normalizeMoney($data['tuition_amount']),
                'miscellaneous_amount' => $this->normalizeMoney($data['miscellaneous_amount']),
                'other_fees_amount' => $this->normalizeMoney($data['other_fees_amount']),
                'discount_amount' => $this->normalizeMoney($data['discount_amount']),
                'total_amount' => $totalAmount,
            ]);

            if (! empty($adjustments)) {
                $adjustmentModels = collect($adjustments)->map(function (array $adjustment) use ($assessment) {
                    return new AssessmentAdjustment([
                        'assessment_id' => $assessment->id,
                        'description' => $adjustment['description'],
                        'amount' => $this->normalizeMoney($adjustment['amount']),
                    ]);
                });

                $assessment->adjustments()->saveMany($adjustmentModels);
            }

            return $assessment->load(['adjustments', 'installments']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return Collection<int, AssessmentInstallment>
     */
    public function createInstallments(Assessment $assessment, array $data): Collection
    {
        return DB::transaction(function () use ($assessment, $data) {
            if ($assessment->installments()->exists()) {
                throw ValidationException::withMessages([
                    'installments' => ['Installments already exist for this assessment.'],
                ]);
            }

            $planType = $data['plan_type'];
            $totalCents = $this->toCents($assessment->total_amount);

            if ($planType === 'full') {
                $dueDate = Carbon::parse($data['due_date']);
                $description = $data['description'] ?? 'Full payment';

                $installment = AssessmentInstallment::create([
                    'assessment_id' => $assessment->id,
                    'due_date' => $dueDate->toDateString(),
                    'description' => $description,
                    'amount' => $this->centsToString($totalCents),
                    'is_paid' => false,
                ]);

                return collect([$installment]);
            }

            if ($planType === 'custom') {
                /** @var array<int, array{due_date: string, description: string, amount: mixed}> $installments */
                $installments = $data['installments'];
                $sumCents = array_sum(array_map(function (array $item): int {
                    return $this->toCents($item['amount']);
                }, $installments));

                if ($sumCents !== $totalCents) {
                    throw ValidationException::withMessages([
                        'installments' => ['Installment total must match assessment total.'],
                    ]);
                }

                $created = collect();
                foreach ($installments as $item) {
                    $created->push(AssessmentInstallment::create([
                        'assessment_id' => $assessment->id,
                        'due_date' => Carbon::parse($item['due_date'])->toDateString(),
                        'description' => $item['description'],
                        'amount' => $this->normalizeMoney($item['amount']),
                        'is_paid' => false,
                    ]));
                }

                return $created;
            }

            $startDate = Carbon::parse($data['start_date']);
            $intervalDays = isset($data['interval_days']) ? (int) $data['interval_days'] : 30;
            $count = 5;
            $installments = $this->splitIntoInstallments($totalCents, $count);

            $created = collect();
            foreach ($installments as $index => $amountCents) {
                $dueDate = $startDate->copy()->addDays($intervalDays * $index)->toDateString();
                $created->push(AssessmentInstallment::create([
                    'assessment_id' => $assessment->id,
                    'due_date' => $dueDate,
                    'description' => 'Installment '.($index + 1),
                    'amount' => $this->centsToString($amountCents),
                    'is_paid' => false,
                ]));
            }

            return $created;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function recordPayment(AssessmentInstallment $installment, array $data): Payment
    {
        return DB::transaction(function () use ($installment, $data) {
            $installment->load('payments');

            $amountCents = $this->toCents($data['amount']);
            $paidCents = $this->toCents($installment->payments->sum('amount'));
            $installmentCents = $this->toCents($installment->amount);
            $outstandingCents = max(0, $installmentCents - $paidCents);

            if ($amountCents > $outstandingCents) {
                throw ValidationException::withMessages([
                    'amount' => ['Payment exceeds outstanding balance.'],
                ]);
            }

            $payment = Payment::create([
                'assessment_installment_id' => $installment->id,
                'amount' => $this->centsToString($amountCents),
                'paid_at' => Carbon::parse($data['paid_at'])->toDateTimeString(),
                'receipt_number' => $data['receipt_number'],
                'cashier_id' => $data['cashier_id'],
            ]);

            $newPaid = $paidCents + $amountCents;
            $installment->is_paid = $newPaid >= $installmentCents;
            $installment->save();

            return $payment;
        });
    }

    public function buildAssessmentPayload(Assessment $assessment): array
    {
        $assessment->loadMissing(['installments.payments', 'adjustments']);
        $netTotal = $this->computeNetAmount(
            $assessment->tuition_amount,
            $assessment->miscellaneous_amount,
            $assessment->other_fees_amount,
            $assessment->discount_amount
        );

        $installments = $assessment->installments->map(function (AssessmentInstallment $installment): array {
            $paidCents = $this->toCents($installment->payments->sum('amount'));
            $amountCents = $this->toCents($installment->amount);
            $outstandingCents = max(0, $amountCents - $paidCents);

            return [
                'id' => $installment->id,
                'due_date' => $installment->due_date?->toDateString(),
                'description' => $installment->description,
                'amount' => $this->centsToString($amountCents),
                'paid_amount' => $this->centsToString($paidCents),
                'outstanding' => $this->centsToString($outstandingCents),
                'is_paid' => $outstandingCents === 0,
            ];
        })->values();

        $adjustments = $assessment->adjustments->map(function (AssessmentAdjustment $adjustment): array {
            return [
                'id' => $adjustment->id,
                'description' => $adjustment->description,
                'amount' => $this->normalizeMoney($adjustment->amount),
            ];
        })->values();

        return [
            'id' => $assessment->id,
            'enrollment_id' => $assessment->enrollment_id,
            'tuition' => $this->normalizeMoney($assessment->tuition_amount),
            'miscellaneous' => $this->normalizeMoney($assessment->miscellaneous_amount),
            'other_fees' => $this->normalizeMoney($assessment->other_fees_amount),
            'discounts' => $this->normalizeMoney($assessment->discount_amount),
            'net_total' => $netTotal,
            'total' => $this->normalizeMoney($assessment->total_amount),
            'grand_total' => $this->normalizeMoney($assessment->total_amount),
            'installments' => $installments,
            'adjustments' => $adjustments,
        ];
    }

    public function buildSummary(Assessment $assessment): array
    {
        $assessment->loadMissing(['installments.payments', 'adjustments']);
        $netTotal = $this->computeNetAmount(
            $assessment->tuition_amount,
            $assessment->miscellaneous_amount,
            $assessment->other_fees_amount,
            $assessment->discount_amount
        );
        $installments = $assessment->installments->map(function (AssessmentInstallment $installment): array {
            $paidCents = $this->toCents($installment->payments->sum('amount'));
            $amountCents = $this->toCents($installment->amount);
            $outstandingCents = max(0, $amountCents - $paidCents);

            return [
                'id' => $installment->id,
                'due_date' => $installment->due_date?->toDateString(),
                'description' => $installment->description,
                'amount' => $this->centsToString($amountCents),
                'paid_amount' => $this->centsToString($paidCents),
                'outstanding' => $this->centsToString($outstandingCents),
                'is_paid' => $outstandingCents === 0,
            ];
        })->values();

        $totalPaidCents = $installments->reduce(function (int $carry, array $item): int {
            return $carry + $this->toCents($item['paid_amount']);
        }, 0);

        $totalOutstandingCents = $installments->reduce(function (int $carry, array $item): int {
            return $carry + $this->toCents($item['outstanding']);
        }, 0);

        return [
            'assessment_id' => $assessment->id,
            'tuition' => $this->normalizeMoney($assessment->tuition_amount),
            'miscellaneous' => $this->normalizeMoney($assessment->miscellaneous_amount),
            'other_fees' => $this->normalizeMoney($assessment->other_fees_amount),
            'discounts' => $this->normalizeMoney($assessment->discount_amount),
            'net_total' => $netTotal,
            'total' => $this->normalizeMoney($assessment->total_amount),
            'grand_total' => $this->normalizeMoney($assessment->total_amount),
            'adjustments' => $assessment->adjustments->map(function (AssessmentAdjustment $adjustment): array {
                return [
                    'id' => $adjustment->id,
                    'description' => $adjustment->description,
                    'amount' => $this->normalizeMoney($adjustment->amount),
                ];
            })->values(),
            'installments' => $installments,
            'total_paid' => $this->centsToString($totalPaidCents),
            'total_outstanding' => $this->centsToString($totalOutstandingCents),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, array{description: string, amount: mixed}>  $adjustments
     */
    private function computeTotalAmount(array $data, array $adjustments): string
    {
        $tuitionCents = $this->toCents($data['tuition_amount']);
        $miscCents = $this->toCents($data['miscellaneous_amount']);
        $otherCents = $this->toCents($data['other_fees_amount']);
        $discountCents = $this->toCents($data['discount_amount']);
        $adjustmentCents = array_sum(array_map(function (array $item): int {
            return $this->toCents($item['amount']);
        }, $adjustments));

        $totalCents = $tuitionCents + $miscCents + $otherCents - $discountCents + $adjustmentCents;

        return $this->centsToString($totalCents);
    }

    private function normalizeMoney(mixed $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }

    private function toCents(mixed $value): int
    {
        return (int) round(((float) $value) * 100);
    }

    private function centsToString(int $value): string
    {
        return number_format($value / 100, 2, '.', '');
    }

    private function computeNetAmount(
        mixed $tuition,
        mixed $miscellaneous,
        mixed $otherFees,
        mixed $discount
    ): string {
        $tuitionCents = $this->toCents($tuition);
        $miscCents = $this->toCents($miscellaneous);
        $otherCents = $this->toCents($otherFees);
        $discountCents = $this->toCents($discount);

        $totalCents = $tuitionCents + $miscCents + $otherCents - $discountCents;

        return $this->centsToString($totalCents);
    }

    /**
     * @return array<int, int>
     */
    private function splitIntoInstallments(int $totalCents, int $count): array
    {
        $base = intdiv($totalCents, $count);
        $remainder = $totalCents % $count;

        $amounts = array_fill(0, $count, $base);
        if ($remainder !== 0) {
            $amounts[$count - 1] += $remainder;
        }

        return $amounts;
    }
}
