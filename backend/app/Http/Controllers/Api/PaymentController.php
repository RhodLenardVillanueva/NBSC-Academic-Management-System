<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/PaymentController.php

use App\Http\Requests\Assessment\StorePaymentRequest;
use App\Models\AssessmentInstallment;
use App\Services\AssessmentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends BaseApiController
{
    public function store(
        StorePaymentRequest $request,
        AssessmentInstallment $installment,
        AssessmentService $assessmentService
    ): JsonResponse {
        $payment = $assessmentService->recordPayment($installment, $request->validated());

        return $this->success($payment, 'Payment recorded.', 201);
    }
}
