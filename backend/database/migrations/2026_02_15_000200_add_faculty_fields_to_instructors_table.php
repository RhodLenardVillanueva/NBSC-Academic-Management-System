<?php

// File: backend/database/migrations/2026_02_15_000200_add_faculty_fields_to_instructors_table.php

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
        Schema::table('instructors', function (Blueprint $table) {
            $table->string('employee_number', 50)->nullable()->after('id');
            $table->string('department', 100)->nullable()->after('email');
            $table->string('status', 20)->default('active')->after('department');
            $table->unique('employee_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instructors', function (Blueprint $table) {
            $table->dropUnique(['employee_number']);
            $table->dropColumn(['employee_number', 'department', 'status']);
        });
    }
};
