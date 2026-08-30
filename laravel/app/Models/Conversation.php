<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'conversations';

    protected $fillable = [
        'platform',
        'platform_thread_id',
        'sender_name',
        'sender_id',
        'sender_avatar',
        'page_name',
        'portfolio_name',
        'status',
        'unread_count',
        'last_message_text',
        'last_message_at',
        'sentiment',
        'lead_id',
    ];

    protected $casts = [
        'unread_count' => 'integer',
        'last_message_at' => 'datetime',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'conversation_id')->orderBy('created_at', 'asc');
    }
}
