<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'comments';

    protected $fillable = [
        'page_id',
        'post_id',
        'comment_id',
        'sender_name',
        'sender_id',
        'message',
        'sentiment',
        'intent',
        'status',
        'reply_message',
        'replied_at',
        'is_private_replied',
    ];

    protected $casts = [
        'replied_at' => 'datetime',
        'is_private_replied' => 'boolean',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(SocialPage::class, 'page_id');
    }
}
