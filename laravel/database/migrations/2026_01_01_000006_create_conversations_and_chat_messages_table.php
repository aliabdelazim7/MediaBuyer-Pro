<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('platform')->default('MESSENGER'); // MESSENGER, INSTAGRAM_DM, WHATSAPP
            $table->string('platform_thread_id')->unique();
            $table->string('sender_name');
            $table->string('sender_id');
            $table->string('sender_avatar')->nullable();
            $table->string('page_name')->nullable();
            $table->string('portfolio_name')->nullable();
            $table->string('status')->default('OPEN'); // OPEN, RESOLVED, FLAGGED
            $table->integer('unread_count')->default(0);
            $table->text('last_message_text');
            $table->timestamp('last_message_at')->useCurrent();
            $table->string('sentiment')->default('INQUIRY_PRICE');
            $table->uuid('lead_id')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('platform');
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->string('sender_type'); // CUSTOMER, AGENT, AI
            $table->text('text');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index('conversation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('conversations');
    }
};
