<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessPortfolio extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'business_portfolios';

    protected $fillable = [
        'name',
        'fb_business_id',
        'user_account_id',
        'verification_status',
        'vertical',
        'primary_page_id',
    ];

    public function userAccount(): BelongsTo
    {
        return $this->belongsTo(FacebookUserAccount::class, 'user_account_id');
    }

    public function adAccounts(): HasMany
    {
        return $this->hasMany(AdAccount::class, 'business_portfolio_id');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(SocialPage::class, 'business_portfolio_id');
    }
}
