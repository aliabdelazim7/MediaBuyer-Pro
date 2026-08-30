<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('platform')->default('FACEBOOK');
            $table->string('page_id')->unique();
            $table->text('access_token')->nullable();
            $table->string('avatar_url')->nullable();
            $table->uuid('business_portfolio_id')->nullable();
            $table->foreign('business_portfolio_id')->references('id')->on('business_portfolios')->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('business_portfolio_id');
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('page_id');
            $table->foreign('page_id')->references('id')->on('social_pages')->onDelete('cascade');
            $table->string('post_id');
            $table->string('comment_id')->unique();
            $table->string('sender_name');
            $table->string('sender_id');
            $table->text('message');
            $table->string('sentiment')->default('NEUTRAL'); // POSITIVE, NEGATIVE, INQUIRY_PRICE, SPAM, NEUTRAL
            $table->string('intent')->default('GENERAL');
            $table->string('status')->default('PENDING'); // PENDING, REPLIED, HIDDEN, RESOLVED
            $table->text('reply_message')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->boolean('is_private_replied')->default(false);
            $table->timestamps();

            $table->index('page_id');
            $table->index('status');
            $table->index('sentiment');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
        Schema::dropIfExists('social_pages');
    }
};
