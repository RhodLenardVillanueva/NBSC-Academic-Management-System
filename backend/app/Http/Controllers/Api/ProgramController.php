<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/ProgramController.php

use App\Http\Requests\Program\StoreProgramRequest;
use App\Http\Requests\Program\UpdateProgramRequest;
use App\Models\Program;
use Illuminate\Http\JsonResponse;

class ProgramController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $programs = Program::query()
            ->orderBy('code')
            ->paginate(20);

        return $this->success($programs, 'Programs retrieved.');
    }

    public function store(StoreProgramRequest $request): JsonResponse
    {
        $program = Program::create($request->validated());

        return $this->success($program, 'Program created.', 201);
    }

    public function show(Program $program): JsonResponse
    {
        return $this->success($program, 'Program retrieved.');
    }

    public function update(UpdateProgramRequest $request, Program $program): JsonResponse
    {
        $program->update($request->validated());

        return $this->success($program, 'Program updated.');
    }

    public function destroy(Program $program): JsonResponse
    {
        $program->delete();

        return $this->success(null, 'Program deleted.');
    }
}