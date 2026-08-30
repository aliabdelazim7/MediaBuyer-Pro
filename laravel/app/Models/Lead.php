<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'leads';

    protected $fillable = [
        'name',
        'phone',
        'email',
        'source',
        'stage',
        'deal_value',
        'currency',
        'notes',
        'assigned_to',
    ];

    protected $casts = [
        'deal_value' => 'float',
    ];
}
