<?php

namespace Tests\Feature;

// File: backend/tests/Feature/TranscriptTest.php

use App\Models\AcademicYear;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
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

class TranscriptTest extends TestCase
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

    /**
     * @param  array<int, array{equivalent: float, units: int}>  $entries
     */
    private function calculateGwa(array $entries): ?float
    {
        $totalUnits = 0;
        $totalPoints = 0.0;

        foreach ($entries as $entry) {
            $totalUnits += $entry['units'];
            $totalPoints += $entry['equivalent'] * $entry['units'];
        }

        return $totalUnits > 0 ? round($totalPoints / $totalUnits, 2) : null;
    }

    public function test_transcript_returns_semesters_and_gwa(): void
    {
        $this->authenticateAdmin();

        $program = Program::factory()->create([
            'name' => 'BS Information Technology',
        ]);

        $student = Student::factory()->create([
            'student_number' => '2026-0009',
            'first_name' => 'Lia',
            'last_name' => 'Reyes',
            'program_id' => $program->id,
        ]);

        $academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);

        $semesterOne = Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '1st Semester',
            'is_current' => true,
        ]);

        $semesterTwo = Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '2nd Semester',
            'is_current' => false,
        ]);

        $subjectA = Subject::create([
            'code' => 'CS601',
            'title' => 'Capstone Planning',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $subjectB = Subject::create([
            'code' => 'CS602',
            'title' => 'Cloud Systems',
            'description' => null,
            'units' => 4,
            'lecture_hours' => 3,
            'lab_hours' => 1,
            'is_active' => true,
        ]);

        $subjectC = Subject::create([
            'code' => 'CS603',
            'title' => 'Enterprise Architecture',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $subjectD = Subject::create([
            'code' => 'CS604',
            'title' => 'Cybersecurity',
            'description' => null,
            'units' => 2,
            'lecture_hours' => 2,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $offeringA = CourseOffering::create([
            'subject_id' => $subjectA->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semesterOne->id,
            'section' => 'A',
            'schedule' => 'MWF 8:00-9:00',
            'room' => 'Room 601',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $offeringB = CourseOffering::create([
            'subject_id' => $subjectB->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semesterOne->id,
            'section' => 'B',
            'schedule' => 'TTH 9:00-10:30',
            'room' => 'Room 602',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $offeringC = CourseOffering::create([
            'subject_id' => $subjectC->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semesterTwo->id,
            'section' => 'A',
            'schedule' => 'MWF 10:00-11:00',
            'room' => 'Room 603',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $offeringD = CourseOffering::create([
            'subject_id' => $subjectD->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semesterTwo->id,
            'section' => 'B',
            'schedule' => 'TTH 13:00-14:30',
            'room' => 'Room 604',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $enrollmentOne = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semesterOne->id,
            'year_level' => 4,
            'total_units' => 0,
            'status' => 'enrolled',
        ]);

        $enrollmentTwo = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semesterTwo->id,
            'year_level' => 4,
            'total_units' => 0,
            'status' => 'enrolled',
        ]);

        EnrollmentSubject::create([
            'enrollment_id' => $enrollmentOne->id,
            'course_offering_id' => $offeringA->id,
            'quiz_score' => 90,
            'case_study_score' => 90,
            'participation_score' => 90,
            'major_exam_score' => 90,
        ]);

        EnrollmentSubject::create([
            'enrollment_id' => $enrollmentOne->id,
            'course_offering_id' => $offeringB->id,
            'quiz_score' => 95,
            'case_study_score' => 95,
            'participation_score' => 95,
            'major_exam_score' => 95,
        ]);

        EnrollmentSubject::create([
            'enrollment_id' => $enrollmentTwo->id,
            'course_offering_id' => $offeringC->id,
            'quiz_score' => 88,
            'case_study_score' => 88,
            'participation_score' => 88,
            'major_exam_score' => 88,
        ]);

        EnrollmentSubject::create([
            'enrollment_id' => $enrollmentTwo->id,
            'course_offering_id' => $offeringD->id,
            'quiz_score' => 86,
            'case_study_score' => 86,
            'participation_score' => 86,
            'major_exam_score' => 86,
        ]);

        $response = $this->getJson('/api/students/'.$student->id.'/transcript');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.student.id', $student->id)
            ->assertJsonCount(2, 'data.semesters');

        $payload = $response->json('data');

        $this->assertNotNull($payload);
        $this->assertSame('2026-0009', $payload['student']['student_number']);

        $semesters = $payload['semesters'];

        $this->assertCount(2, $semesters);

        $semesterOneSubjects = collect($semesters[0]['subjects'])->keyBy('code');
        $semesterTwoSubjects = collect($semesters[1]['subjects'])->keyBy('code');

        $this->assertCount(2, $semesterOneSubjects);
        $this->assertCount(2, $semesterTwoSubjects);

        $this->assertEqualsWithDelta(90.0, $semesterOneSubjects['CS601']['percentage'], 0.01);
        $this->assertEqualsWithDelta(3.25, $semesterOneSubjects['CS601']['equivalent_grade'], 0.01);
        $this->assertSame('PASSED', $semesterOneSubjects['CS601']['remarks']);

        $this->assertEqualsWithDelta(95.0, $semesterOneSubjects['CS602']['percentage'], 0.01);
        $this->assertEqualsWithDelta(3.75, $semesterOneSubjects['CS602']['equivalent_grade'], 0.01);

        $this->assertEqualsWithDelta(88.0, $semesterTwoSubjects['CS603']['percentage'], 0.01);
        $this->assertEqualsWithDelta(3.0, $semesterTwoSubjects['CS603']['equivalent_grade'], 0.01);

        $this->assertEqualsWithDelta(86.0, $semesterTwoSubjects['CS604']['percentage'], 0.01);
        $this->assertEqualsWithDelta(2.75, $semesterTwoSubjects['CS604']['equivalent_grade'], 0.01);

        $expectedSemesterOneGwa = $this->calculateGwa([
            ['equivalent' => 3.25, 'units' => 3],
            ['equivalent' => 3.75, 'units' => 4],
        ]);

        $expectedSemesterTwoGwa = $this->calculateGwa([
            ['equivalent' => 3.0, 'units' => 3],
            ['equivalent' => 2.75, 'units' => 2],
        ]);

        $expectedCumulativeGwa = $this->calculateGwa([
            ['equivalent' => 3.25, 'units' => 3],
            ['equivalent' => 3.75, 'units' => 4],
            ['equivalent' => 3.0, 'units' => 3],
            ['equivalent' => 2.75, 'units' => 2],
        ]);

        $this->assertEqualsWithDelta($expectedSemesterOneGwa, $semesters[0]['semester_gwa'], 0.01);
        $this->assertEqualsWithDelta($expectedSemesterTwoGwa, $semesters[1]['semester_gwa'], 0.01);
        $this->assertEqualsWithDelta($expectedCumulativeGwa, $payload['cumulative_gwa'], 0.01);
    }
}
