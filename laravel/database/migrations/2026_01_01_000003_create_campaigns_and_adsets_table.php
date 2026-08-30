<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('platform_id')->unique();
            $table->uuid('ad_account_id');
            $table->foreign('ad_account_id')->references('id')->on('ad_accounts')->onDelete('cascade');
            $table->string('status')->default('ACTIVE');
            $table->string('objective')->default('OUTCOME_SALES');
            $table->double('daily_budget')->default(0);
            $table->double('lifetime_budget')->default(0);
            $table->double('spend')->default(0);
            $table->integer('impressions')->default(0);
            $table->integer('clicks')->default(0);
            $table->double('cpc')->default(0);
            $table->double('cpm')->default(0);
            $table->double('ctr')->default(0);
            $table->integer('conversions')->default(0);
            $table->double('cpa')->default(0);
            $table->double('roas')->default(0);
            $table->double('conversion_value')->default(0);
            $table->timestamp('last_synced_at')->useCurrent();
            $table->timestamps();

            $table->index('status');
            $table->index('ad_account_id');
        });

        Schema::create('ad_sets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('platform_id')->unique();
            $table->uuid('campaign_id');
            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('cascade');
            $table->string('status')->default('ACTIVE');
            $table->double('daily_budget')->default(0);
            $table->double('spend')->default(0);
            $table->double('cpa')->default(0);
            $table->double('roas')->default(0);
            $table->integer('conversions')->default(0);
            $table->timestamp('last_synced_at')->useCurrent();
            $table->timestamps();

            $table->index('campaign_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_sets');
        Schema::dropIfExists('campaigns');
    }
};
