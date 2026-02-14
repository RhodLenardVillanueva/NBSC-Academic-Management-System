<?php

namespace App\Models;

// File: backend/app/Models/Assessment.php

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assessment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'enrollment_id',
        'tuition_amount',
        'miscellaneous_amount',
        'other_fees_amount',
        'discount_amount',
        'total_amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tuition_amount' => 'decimal:2',
            'miscellaneous_amount' => 'decimal:2',
            'other_fees_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(AssessmentInstallment::class);
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(AssessmentAdjustment::class);
    }
}
