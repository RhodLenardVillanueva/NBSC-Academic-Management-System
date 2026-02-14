<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/StudentController.php

use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Models\Student;
use Illuminate\Http\JsonResponse;

class StudentController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $archived = request()->boolean('archived');

        $query = Student::query();

        if ($archived) {
            $query->onlyTrashed();
        }

        $students = $query
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(20);

        return $this->success($students, 'Students retrieved.');
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = Student::create($request->validated());

        return $this->success($student, 'Student created.', 201);
    }

    public function show(Student $student): JsonResponse
    {
        return $this->success($student, 'Student retrieved.');
    }

    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $student->update($request->validated());

        return $this->success($student, 'Student updated.');
    }

    public function destroy(Student $student): JsonResponse
    {
        $student->delete();

        return $this->success(null, 'Student deleted.');
    }

    public function restore(int $id): JsonResponse
    {
        $student = Student::withTrashed()->findOrFail($id);

        if ($student->trashed()) {
            $student->restore();
        }

        return $this->success($student->fresh(), 'Student restored.');
    }
}
