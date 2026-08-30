<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacebookUserAccount extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'facebook_user_accounts';

    protected $fillable = [
        'name',
        'fb_user_id',
        'access_token',
        'token_expires_at',
        'avatar_url',
        'status',
    ];

    protected $casts = [
        'token_expires_at' => 'datetime',
    ];

    public function portfolios(): HasMany
    {
        return $this->hasMany(BusinessPortfolio::class, 'user_account_id');
    }

    public function adAccounts(): HasMany
    {
        return $this->hasMany(AdAccount::class, 'user_account_id');
    }
}
