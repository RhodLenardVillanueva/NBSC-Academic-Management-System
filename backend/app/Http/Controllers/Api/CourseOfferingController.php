<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/CourseOfferingController.php

use App\Http\Requests\CourseOffering\StoreCourseOfferingRequest;
use App\Http\Requests\CourseOffering\UpdateCourseOfferingRequest;
use App\Models\CourseOffering;
use Illuminate\Http\JsonResponse;

class CourseOfferingController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $courseOfferings = CourseOffering::query()
            ->orderByDesc('id')
            ->paginate(20);

        return $this->success($courseOfferings, 'Course offerings retrieved.');
    }

    public function store(StoreCourseOfferingRequest $request): JsonResponse
    {
        $courseOffering = CourseOffering::create($request->validated());

        return $this->success($courseOffering, 'Course offering created.', 201);
    }

    public function show(CourseOffering $courseOffering): JsonResponse
    {
        return $this->success($courseOffering, 'Course offering retrieved.');
    }

    public function update(UpdateCourseOfferingRequest $request, CourseOffering $courseOffering): JsonResponse
    {
        $courseOffering->update($request->validated());

        return $this->success($courseOffering, 'Course offering updated.');
    }

    public function destroy(CourseOffering $courseOffering): JsonResponse
    {
        $courseOffering->delete();

        return $this->success(null, 'Course offering deleted.');
    }
}