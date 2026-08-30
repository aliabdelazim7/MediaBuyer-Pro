<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'campaigns';

    protected $fillable = [
        'name',
        'platform_id',
        'ad_account_id',
        'status',
        'objective',
        'daily_budget',
        'lifetime_budget',
        'spend',
        'impressions',
        'clicks',
        'cpc',
        'cpm',
        'ctr',
        'conversions',
        'cpa',
        'roas',
        'conversion_value',
        'last_synced_at',
    ];

    protected $casts = [
        'daily_budget' => 'float',
        'lifetime_budget' => 'float',
        'spend' => 'float',
        'impressions' => 'integer',
        'clicks' => 'integer',
        'cpc' => 'float',
        'cpm' => 'float',
        'ctr' => 'float',
        'conversions' => 'integer',
        'cpa' => 'float',
        'roas' => 'float',
        'conversion_value' => 'float',
        'last_synced_at' => 'datetime',
    ];

    public function adAccount(): BelongsTo
    {
        return $this->belongsTo(AdAccount::class, 'ad_account_id');
    }

    public function adSets(): HasMany
    {
        return $this->hasMany(AdSet::class, 'campaign_id');
    }

    public function ruleLogs(): HasMany
    {
        return $this->hasMany(RuleLog::class, 'campaign_id');
    }
}
