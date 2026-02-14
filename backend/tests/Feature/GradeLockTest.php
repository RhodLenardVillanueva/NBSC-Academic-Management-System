<?php

namespace Tests\Feature;

// File: backend/tests/Feature/GradeLockTest.php

use App\Models\AcademicYear;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use App\Models\Instructor;
use App\Models\Program;
use App\Models\Role;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GradeLockTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateFaculty(string $email = 'faculty.lock@example.com'): void
    {
        $this->seed(RoleSeeder::class);

        $facultyRole = Role::where('name', 'Faculty')->first();

        $this->assertNotNull($facultyRole);

        $user = User::factory()->create([
            'email' => $email,
        ]);

        $user->roles()->syncWithoutDetaching([$facultyRole->id]);

        Sanctum::actingAs($user, ['*']);
    }

    private function seedEnrollmentSubject(string $facultyEmail): EnrollmentSubject
    {
        $program = Program::factory()->create();
        $student = Student::factory()->create([
            'program_id' => $program->id,
        ]);

        $academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);

        $semester = Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '2nd Semester',
            'is_current' => true,
        ]);

        $subject = Subject::create([
            'code' => 'CS801',
            'title' => 'Security Audits',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $instructor = Instructor::create([
            'employee_number' => 'EMP-8001',
            'first_name' => 'Aria',
            'last_name' => 'Lim',
            'email' => $facultyEmail,
            'department' => 'Information Systems',
            'status' => 'active',
        ]);

        $courseOffering = CourseOffering::create([
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'C',
            'schedule' => 'MWF 14:00-15:00',
            'room' => 'Room 801',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 2,
            'total_units' => 0,
            'status' => 'enrolled',
        ]);

        return EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOffering->id,
        ]);
    }

    public function test_grades_are_locked_after_submission(): void
    {
        $email = 'faculty.lock@example.com';
        $this->authenticateFaculty($email);

        $enrollmentSubject = $this->seedEnrollmentSubject($email);

        $gradePayload = [
            'quizzes' => 92,
            'projects' => 92,
            'participation' => 92,
            'major_exams' => 92,
        ];

        $this->putJson('/api/enrollment-subjects/'.$enrollmentSubject->id.'/grade', $gradePayload)
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $submitResponse = $this->postJson('/api/enrollment-subjects/'.$enrollmentSubject->id.'/submit');

        $submitResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_submitted', true);

        $lockedResponse = $this->putJson('/api/enrollment-subjects/'.$enrollmentSubject->id.'/grade', [
            'quizzes' => 95,
        ]);

        $lockedResponse->assertStatus(422)
            ->assertJsonPath('errors.grade.0', 'Grades are locked.');
    }
}
