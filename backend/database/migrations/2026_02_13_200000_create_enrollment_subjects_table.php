<?php

// File: backend/database/migrations/2026_02_13_200000_create_enrollment_subjects_table.php

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
        Schema::create('enrollment_subjects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('enrollment_id');
            $table->unsignedBigInteger('course_offering_id');
            $table->decimal('grade', 5, 2)->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['enrollment_id', 'course_offering_id']);

            $table->foreign('enrollment_id')->references('id')->on('enrollments')->cascadeOnDelete();
            $table->foreign('course_offering_id')->references('id')->on('course_offerings')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollment_subjects');
    }
};