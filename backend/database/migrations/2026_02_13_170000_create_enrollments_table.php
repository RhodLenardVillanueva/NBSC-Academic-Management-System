<?php

// File: backend/database/migrations/2026_02_13_170000_create_enrollments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('program_id');
            $table->unsignedBigInteger('academic_year_id');
            $table->unsignedBigInteger('semester_id');
            $table->unsignedInteger('year_level');
            $table->unsignedInteger('total_units')->default(0);
            $table->enum('status', ['enrolled', 'cancelled', 'completed'])->default('enrolled');
            $table->timestamps();

            $table->unique(['student_id', 'academic_year_id', 'semester_id']);

            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('program_id')->references('id')->on('programs')->cascadeOnDelete();
            $table->foreign('academic_year_id')->references('id')->on('academic_years')->cascadeOnDelete();
            $table->foreign('semester_id')->references('id')->on('semesters')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};