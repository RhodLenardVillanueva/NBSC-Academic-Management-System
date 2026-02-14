<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/InstructorController.php

use App\Http\Requests\Instructor\StoreInstructorRequest;
use App\Http\Requests\Instructor\UpdateInstructorRequest;
use App\Models\Instructor;
use Illuminate\Http\JsonResponse;

class InstructorController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $search = request()->string('search')->trim()->toString();

        $query = Instructor::query();

        if ($search !== '') {
            $like = "%{$search}%";
            $query->where(function ($builder) use ($like) {
                $builder
                    ->where('employee_number', 'like', $like)
                    ->orWhere('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('department', 'like', $like);
            });
        }

        $instructors = $query
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(20);

        return $this->success($instructors, 'Instructors retrieved.');
    }

    public function store(StoreInstructorRequest $request): JsonResponse
    {
        $instructor = Instructor::create($request->validated());

        return $this->success($instructor, 'Instructor created.', 201);
    }

    public function show(Instructor $instructor): JsonResponse
    {
        return $this->success($instructor, 'Instructor retrieved.');
    }

    public function update(UpdateInstructorRequest $request, Instructor $instructor): JsonResponse
    {
        $instructor->update($request->validated());

        return $this->success($instructor, 'Instructor updated.');
    }

    public function destroy(Instructor $instructor): JsonResponse
    {
        $instructor->delete();

        return $this->success(null, 'Instructor deleted.');
    }
}
