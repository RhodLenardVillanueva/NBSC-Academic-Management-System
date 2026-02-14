<?php

namespace Tests\Feature;

// File: backend/tests/Feature/CourseOfferingCrudTest.php

use App\Models\AcademicYear;
use App\Models\CourseOffering;
use App\Models\Instructor;
use App\Models\Role;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CourseOfferingCrudTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateAdmin(): void
    {
        $this->seed(RoleSeeder::class);

        $adminRole = Role::where('name', 'Admin')->first();

        $this->assertNotNull($adminRole);

        $user = User::factory()->create([
            'email' => 'admin@example.com',
        ]);

        $user->roles()->syncWithoutDetaching([$adminRole->id]);

        Sanctum::actingAs($user, ['*']);
    }

    private function seedCourseOfferingDependencies(): array
    {
        $subject = Subject::create([
            'code' => 'CS101',
            'title' => 'Introduction to Computing',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
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

        $instructor = Instructor::create([
            'employee_number' => 'EMP-1001',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria.santos@example.com',
            'department' => 'Computer Science',
            'status' => 'active',
        ]);

        return [$subject, $academicYear, $semester, $instructor];
    }

    public function test_can_list_course_offerings(): void
    {
        $this->authenticateAdmin();

        [$subject, $academicYear, $semester, $instructor] = $this->seedCourseOfferingDependencies();

        CourseOffering::create([
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'A',
            'schedule' => 'MWF 9:00-10:00',
            'room' => 'Room 101',
            'max_slots' => 50,
            'slots_taken' => 10,
            'is_active' => true,
        ]);

        CourseOffering::create([
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'B',
            'schedule' => 'TTH 10:00-11:30',
            'room' => 'Room 102',
            'max_slots' => 50,
            'slots_taken' => 12,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/course-offerings');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_can_create_course_offering(): void
    {
        $this->authenticateAdmin();

        [$subject, $academicYear, $semester, $instructor] = $this->seedCourseOfferingDependencies();

        $payload = [
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'C',
            'schedule' => 'MWF 1:00-2:00',
            'room' => 'Room 103',
            'max_slots' => 45,
            'is_active' => true,
        ];

        $response = $this->postJson('/api/course-offerings', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.section', 'C');

        $this->assertDatabaseHas('course_offerings', [
            'subject_id' => $subject->id,
            'section' => 'C',
        ]);
    }

    public function test_can_show_course_offering(): void
    {
        $this->authenticateAdmin();

        [$subject, $academicYear, $semester, $instructor] = $this->seedCourseOfferingDependencies();

        $courseOffering = CourseOffering::create([
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'D',
            'schedule' => null,
            'room' => null,
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/course-offerings/'.$courseOffering->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.section', 'D');
    }

    public function test_can_update_course_offering(): void
    {
        $this->authenticateAdmin();

        [$subject, $academicYear, $semester, $instructor] = $this->seedCourseOfferingDependencies();

        $courseOffering = CourseOffering::create([
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'E',
            'schedule' => null,
            'room' => null,
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $payload = [
            'room' => 'Lab 201',
        ];

        $response = $this->putJson('/api/course-offerings/'.$courseOffering->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slots_taken', 0);

        $this->assertDatabaseHas('course_offerings', [
            'id' => $courseOffering->id,
            'room' => 'Lab 201',
            'slots_taken' => 0,
        ]);
    }

    public function test_can_delete_course_offering(): void
    {
        $this->authenticateAdmin();

        [$subject, $academicYear, $semester, $instructor] = $this->seedCourseOfferingDependencies();

        $courseOffering = CourseOffering::create([
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'F',
            'schedule' => null,
            'room' => null,
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $response = $this->deleteJson('/api/course-offerings/'.$courseOffering->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('course_offerings', [
            'id' => $courseOffering->id,
        ]);
    }
}
