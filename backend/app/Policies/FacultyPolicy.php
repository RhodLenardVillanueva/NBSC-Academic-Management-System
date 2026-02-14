<?php

namespace App\Policies;

// File: backend/app/Policies/FacultyPolicy.php

use App\Models\CourseOffering;
use App\Models\EnrollmentSubject;
use App\Models\User;

class FacultyPolicy
{
    public function viewCourseOfferings(User $user): bool
    {
        return $this->hasAnyRole($user, ['Admin', 'Registrar', 'Faculty']);
    }

    public function viewCourseOfferingStudents(User $user, CourseOffering $courseOffering): bool
    {
        if ($this->hasAnyRole($user, ['Admin', 'Registrar'])) {
            return true;
        }

        return $this->isAssignedFaculty($user, $courseOffering);
    }

    public function updateGrade(User $user, EnrollmentSubject $enrollmentSubject): bool
    {
        if (! $this->hasAnyRole($user, ['Faculty'])) {
            return false;
        }

        $courseOffering = $enrollmentSubject->courseOffering;

        if ($courseOffering === null) {
            return false;
        }

        return $this->isAssignedFaculty($user, $courseOffering);
    }

    public function submitGrade(User $user, EnrollmentSubject $enrollmentSubject): bool
    {
        return $this->updateGrade($user, $enrollmentSubject);
    }

    /**
     * @param  array<int, string>  $roles
     */
    private function hasAnyRole(User $user, array $roles): bool
    {
        return $user->roles()->whereIn('name', $roles)->exists();
    }

    private function isAssignedFaculty(User $user, CourseOffering $courseOffering): bool
    {
        $instructor = $courseOffering->instructor;

        if ($instructor === null || $instructor->email === null || $user->email === null) {
            return false;
        }

        return strtolower($instructor->email) === strtolower($user->email);
    }
}
