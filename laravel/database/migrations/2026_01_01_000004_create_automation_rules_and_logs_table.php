<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->string('target_type')->default('CAMPAIGN');
            $table->string('metric'); // CPA, ROAS, SPEND, CTR, CPM, CONVERSIONS
            $table->string('operator'); // GREATER_THAN, LESS_THAN, etc.
            $table->double('threshold');
            $table->double('min_spend_condition')->nullable()->default(0);
            $table->integer('min_conversions_condition')->nullable()->default(0);
            $table->string('action'); // PAUSE, UNPAUSE, BOOST_BUDGET, DECREASE_BUDGET, SEND_ALERT
            $table->double('action_param')->nullable()->default(0);
            $table->boolean('notify_telegram')->default(true);
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamps();
        });

        Schema::create('rule_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('rule_id');
            $table->foreign('rule_id')->references('id')->on('automation_rules')->onDelete('cascade');
            $table->uuid('campaign_id')->nullable();
            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('set null');
            $table->string('target_name');
            $table->string('action_taken');
            $table->text('reason');
            $table->double('metric_value');
            $table->timestamps();

            $table->index('rule_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rule_logs');
        Schema::dropIfExists('automation_rules');
    }
};
