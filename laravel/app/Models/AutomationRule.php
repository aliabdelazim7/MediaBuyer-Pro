<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutomationRule extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'automation_rules';

    protected $fillable = [
        'name',
        'description',
        'is_enabled',
        'target_type',
        'metric',
        'operator',
        'threshold',
        'min_spend_condition',
        'min_conversions_condition',
        'action',
        'action_param',
        'notify_telegram',
        'last_triggered_at',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'threshold' => 'float',
        'min_spend_condition' => 'float',
        'min_conversions_condition' => 'integer',
        'action_param' => 'float',
        'notify_telegram' => 'boolean',
        'last_triggered_at' => 'datetime',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(RuleLog::class, 'rule_id');
    }
}
