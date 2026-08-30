<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdSet extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ad_sets';

    protected $fillable = [
        'name',
        'platform_id',
        'campaign_id',
        'status',
        'daily_budget',
        'spend',
        'cpa',
        'roas',
        'conversions',
        'last_synced_at',
    ];

    protected $casts = [
        'daily_budget' => 'float',
        'spend' => 'float',
        'cpa' => 'float',
        'roas' => 'float',
        'conversions' => 'integer',
        'last_synced_at' => 'datetime',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }
}
