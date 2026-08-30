<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_portfolios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('fb_business_id')->unique();
            $table->uuid('user_account_id');
            $table->foreign('user_account_id')->references('id')->on('facebook_user_accounts')->onDelete('cascade');
            $table->string('verification_status')->default('VERIFIED');
            $table->string('vertical')->nullable()->default('ECOMMERCE');
            $table->string('primary_page_id')->nullable();
            $table->timestamps();

            $table->index('user_account_id');
        });

        Schema::create('ad_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('platform')->default('META');
            $table->string('currency')->default('USD');
            $table->string('account_id')->unique();
            $table->text('access_token')->nullable();
            $table->string('status')->default('ACTIVE');
            $table->uuid('user_account_id')->nullable();
            $table->foreign('user_account_id')->references('id')->on('facebook_user_accounts')->onDelete('set null');
            $table->uuid('business_portfolio_id')->nullable();
            $table->foreign('business_portfolio_id')->references('id')->on('business_portfolios')->onDelete('set null');
            $table->timestamps();

            $table->index('business_portfolio_id');
            $table->index('user_account_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_accounts');
        Schema::dropIfExists('business_portfolios');
    }
};
