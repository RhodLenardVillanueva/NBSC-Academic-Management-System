<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/SemesterController.php

use App\Http\Requests\Semester\StoreSemesterRequest;
use App\Http\Requests\Semester\UpdateSemesterRequest;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;

class SemesterController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $semesters = Semester::query()
            ->orderByDesc('id')
            ->paginate(20);

        return $this->success($semesters, 'Semesters retrieved.');
    }

    public function store(StoreSemesterRequest $request): JsonResponse
    {
        $semester = Semester::create($request->validated());

        return $this->success($semester, 'Semester created.', 201);
    }

    public function show(Semester $semester): JsonResponse
    {
        return $this->success($semester, 'Semester retrieved.');
    }

    public function update(UpdateSemesterRequest $request, Semester $semester): JsonResponse
    {
        $semester->update($request->validated());

        return $this->success($semester, 'Semester updated.');
    }

    public function destroy(Semester $semester): JsonResponse
    {
        $semester->delete();

        return $this->success(null, 'Semester deleted.');
    }
}