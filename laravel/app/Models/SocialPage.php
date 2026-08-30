<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SocialPage extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'social_pages';

    protected $fillable = [
        'name',
        'platform',
        'page_id',
        'access_token',
        'avatar_url',
        'business_portfolio_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function businessPortfolio(): BelongsTo
    {
        return $this->belongsTo(BusinessPortfolio::class, 'business_portfolio_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'page_id');
    }
}
