<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/SubjectController.php

use App\Http\Requests\Subject\StoreSubjectRequest;
use App\Http\Requests\Subject\UpdateSubjectRequest;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;

class SubjectController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $subjects = Subject::query()
            ->orderBy('code')
            ->paginate(20);

        return $this->success($subjects, 'Subjects retrieved.');
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $subject = Subject::create($request->validated());

        return $this->success($subject, 'Subject created.', 201);
    }

    public function show(Subject $subject): JsonResponse
    {
        return $this->success($subject, 'Subject retrieved.');
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        $subject->update($request->validated());

        return $this->success($subject, 'Subject updated.');
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $subject->delete();

        return $this->success(null, 'Subject deleted.');
    }
}