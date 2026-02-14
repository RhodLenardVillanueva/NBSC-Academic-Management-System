<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/AssessmentInstallmentController.php

use App\Http\Requests\Assessment\StoreAssessmentInstallmentsRequest;
use App\Models\Assessment;
use App\Services\AssessmentService;
use Illuminate\Http\JsonResponse;

class AssessmentInstallmentController extends BaseApiController
{
    public function store(
        StoreAssessmentInstallmentsRequest $request,
        Assessment $assessment,
        AssessmentService $assessmentService
    ): JsonResponse {
        $installments = $assessmentService->createInstallments($assessment, $request->validated());

        return $this->success($installments, 'Installments created.', 201);
    }
}
