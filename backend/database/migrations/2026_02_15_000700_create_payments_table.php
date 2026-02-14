<?php

// File: backend/database/migrations/2026_02_15_000700_create_payments_table.php

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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assessment_installment_id');
            $table->decimal('amount', 10, 2)->default(0);
            $table->dateTime('paid_at');
            $table->string('receipt_number', 100);
            $table->unsignedBigInteger('cashier_id');
            $table->timestamps();

            $table->foreign('assessment_installment_id')
                ->references('id')
                ->on('assessment_installments')
                ->cascadeOnDelete();
            $table->foreign('cashier_id')
                ->references('id')
                ->on('users')
                ->restrictOnDelete();
            $table->index(['assessment_installment_id', 'paid_at']);
            $table->index('cashier_id');
            $table->index('receipt_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
