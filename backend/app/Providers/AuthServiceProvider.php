<?php

namespace App\Providers;

// File: backend/app/Providers/AuthServiceProvider.php

use App\Policies\FacultyPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        Gate::define('viewFacultyCourseOfferings', [FacultyPolicy::class, 'viewCourseOfferings']);
        Gate::define('viewCourseOfferingStudents', [FacultyPolicy::class, 'viewCourseOfferingStudents']);
        Gate::define('updateEnrollmentGrade', [FacultyPolicy::class, 'updateGrade']);
        Gate::define('submitEnrollmentGrade', [FacultyPolicy::class, 'submitGrade']);
    }
}
