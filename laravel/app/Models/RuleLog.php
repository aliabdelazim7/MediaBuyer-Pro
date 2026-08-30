<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RuleLog extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'rule_logs';

    protected $fillable = [
        'rule_id',
        'campaign_id',
        'target_name',
        'action_taken',
        'reason',
        'metric_value',
    ];

    protected $casts = [
        'metric_value' => 'float',
    ];

    public function rule(): BelongsTo
    {
        return $this->belongsTo(AutomationRule::class, 'rule_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }
}
