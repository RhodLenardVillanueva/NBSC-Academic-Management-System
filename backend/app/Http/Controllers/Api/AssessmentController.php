<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/AssessmentController.php

use App\Http\Requests\Assessment\StoreAssessmentRequest;
use App\Models\Assessment;
use App\Models\Enrollment;
use App\Services\AssessmentService;
use Illuminate\Http\JsonResponse;

class AssessmentController extends BaseApiController
{
    public function showByEnrollment(
        Enrollment $enrollment,
        AssessmentService $assessmentService
    ): JsonResponse {
        $assessment = Assessment::query()
            ->with(['installments.payments', 'adjustments'])
            ->where('enrollment_id', $enrollment->id)
            ->first();

        if (! $assessment) {
            return $this->success(null, 'Assessment not found.');
        }

        return $this->success(
            $assessmentService->buildAssessmentPayload($assessment),
            'Assessment retrieved.'
        );
    }

    public function storeByEnrollment(
        StoreAssessmentRequest $request,
        Enrollment $enrollment,
        AssessmentService $assessmentService
    ): JsonResponse {
        if ($enrollment->assessment()->exists()) {
            return $this->error('Assessment already exists.', 422, [
                'assessment' => ['Assessment already exists for this enrollment.'],
            ]);
        }

        $assessment = $assessmentService->createAssessment($enrollment, $request->validated());

        return $this->success(
            $assessmentService->buildAssessmentPayload($assessment),
            'Assessment created.',
            201
        );
    }

    public function summary(Assessment $assessment, AssessmentService $assessmentService): JsonResponse
    {
        return $this->success(
            $assessmentService->buildSummary($assessment),
            'Assessment summary retrieved.'
        );
    }
}
