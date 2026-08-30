<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdAccount extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ad_accounts';

    protected $fillable = [
        'name',
        'platform',
        'currency',
        'account_id',
        'access_token',
        'status',
        'user_account_id',
        'business_portfolio_id',
    ];

    public function userAccount(): BelongsTo
    {
        return $this->belongsTo(FacebookUserAccount::class, 'user_account_id');
    }

    public function businessPortfolio(): BelongsTo
    {
        return $this->belongsTo(BusinessPortfolio::class, 'business_portfolio_id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class, 'ad_account_id');
    }
}
