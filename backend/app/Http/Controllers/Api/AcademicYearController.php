<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/AcademicYearController.php

use App\Http\Requests\AcademicYear\StoreAcademicYearRequest;
use App\Http\Requests\AcademicYear\UpdateAcademicYearRequest;
use App\Models\AcademicYear;
use Illuminate\Http\JsonResponse;

class AcademicYearController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $academicYears = AcademicYear::query()
            ->orderByDesc('name')
            ->paginate(20);

        return $this->success($academicYears, 'Academic years retrieved.');
    }

    public function store(StoreAcademicYearRequest $request): JsonResponse
    {
        $academicYear = AcademicYear::create($request->validated());

        return $this->success($academicYear, 'Academic year created.', 201);
    }

    public function show(AcademicYear $academicYear): JsonResponse
    {
        return $this->success($academicYear, 'Academic year retrieved.');
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear): JsonResponse
    {
        $academicYear->update($request->validated());

        return $this->success($academicYear, 'Academic year updated.');
    }

    public function destroy(AcademicYear $academicYear): JsonResponse
    {
        $academicYear->delete();

        return $this->success(null, 'Academic year deleted.');
    }
}