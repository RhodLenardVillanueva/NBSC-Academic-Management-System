<?php

namespace Tests\Feature;

// File: backend/tests/Feature/FacultyGradeWorkflowTest.php

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

class FacultyGradeWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateFaculty(string $email = 'faculty@example.com'): User
    {
        $this->seed(RoleSeeder::class);

        $facultyRole = Role::where('name', 'Faculty')->first();

        $this->assertNotNull($facultyRole);

        $user = User::factory()->create([
            'email' => $email,
        ]);

        $user->roles()->syncWithoutDetaching([$facultyRole->id]);

        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    /**
     * @return array{CourseOffering, CourseOffering, EnrollmentSubject}
     */
    private function seedOfferingWithEnrollment(string $facultyEmail): array
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
            'name' => '1st Semester',
            'is_current' => true,
        ]);

        $subject = Subject::create([
            'code' => 'CS701',
            'title' => 'Systems Integration',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $otherSubject = Subject::create([
            'code' => 'CS702',
            'title' => 'Quality Assurance',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $instructor = Instructor::create([
            'employee_number' => 'EMP-7001',
            'first_name' => 'Mika',
            'last_name' => 'Santos',
            'email' => $facultyEmail,
            'department' => 'Information Systems',
            'status' => 'active',
        ]);

        $otherInstructor = Instructor::create([
            'employee_number' => 'EMP-7002',
            'first_name' => 'Leo',
            'last_name' => 'Garcia',
            'email' => 'other.faculty@example.com',
            'department' => 'Information Systems',
            'status' => 'active',
        ]);

        $courseOffering = CourseOffering::create([
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'A',
            'schedule' => 'MWF 8:00-9:00',
            'room' => 'Room 701',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $otherCourseOffering = CourseOffering::create([
            'subject_id' => $otherSubject->id,
            'instructor_id' => $otherInstructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'B',
            'schedule' => 'TTH 10:00-11:30',
            'room' => 'Room 702',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 3,
            'total_units' => 0,
            'status' => 'enrolled',
        ]);

        $enrollmentSubject = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOffering->id,
        ]);

        EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $otherCourseOffering->id,
        ]);

        return [$courseOffering, $otherCourseOffering, $enrollmentSubject];
    }

    public function test_faculty_can_view_offerings_students_and_encode_grades(): void
    {
        $email = 'faculty@example.com';
        $this->authenticateFaculty($email);

        [$courseOffering, $otherCourseOffering, $enrollmentSubject] = $this->seedOfferingWithEnrollment($email);

        $response = $this->getJson('/api/faculty/course-offerings');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $payload = $response->json('data.data');

        $this->assertNotNull($payload);
        $this->assertCount(1, $payload);
        $this->assertSame($courseOffering->id, $payload[0]['id']);
        $this->assertNotSame($otherCourseOffering->id, $payload[0]['id']);

        $studentsResponse = $this->getJson('/api/course-offerings/'.$courseOffering->id.'/students');

        $studentsResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.students.0.enrollment_subject_id', $enrollmentSubject->id);

        $gradePayload = [
            'quizzes' => 90,
            'projects' => 90,
            'participation' => 90,
            'major_exams' => 90,
        ];

        $gradeResponse = $this->putJson('/api/enrollment-subjects/'.$enrollmentSubject->id.'/grade', $gradePayload);

        $gradeResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.final_numeric_grade', '90.00')
            ->assertJsonPath('data.grade_point', '3.25')
            ->assertJsonPath('data.remarks', 'Passed');
    }
}
