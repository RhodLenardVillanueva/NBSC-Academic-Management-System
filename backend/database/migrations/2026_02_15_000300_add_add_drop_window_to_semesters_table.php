<?php

// File: backend/database/migrations/2026_02_15_000300_add_add_drop_window_to_semesters_table.php

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
        Schema::table('semesters', function (Blueprint $table) {
            $table->date('add_drop_start')->nullable()->after('is_current');
            $table->date('add_drop_end')->nullable()->after('add_drop_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->dropColumn(['add_drop_start', 'add_drop_end']);
        });
    }
};
