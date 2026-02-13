<?php

namespace App\Models;

// File: backend/app/Models/Subject.php

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'title',
        'description',
        'units',
        'lecture_hours',
        'lab_hours',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'units' => 'integer',
            'lecture_hours' => 'integer',
            'lab_hours' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}