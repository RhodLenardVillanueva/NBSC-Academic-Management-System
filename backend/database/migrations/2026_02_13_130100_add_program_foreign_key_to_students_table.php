<?php

// File: backend/database/migrations/2026_02_13_130100_add_program_foreign_key_to_students_table.php

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
        if (! Schema::hasTable('programs') || ! Schema::hasTable('students')) {
            return;
        }

        Schema::table('students', function (Blueprint $table) {
            $table->foreign('program_id')
                ->references('id')
                ->on('programs')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('programs') || ! Schema::hasTable('students')) {
            return;
        }

        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['program_id']);
        });
    }
};
