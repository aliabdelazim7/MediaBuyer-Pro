<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('source')->default('COMMENT');
            $table->string('stage')->default('NEW'); // NEW, CONTACTED, QUALIFIED, NEGOTIATING, WON, LOST
            $table->double('deal_value')->default(0);
            $table->string('currency')->default('EGP');
            $table->text('notes')->nullable();
            $table->string('assigned_to')->nullable();
            $table->timestamps();

            $table->index('stage');
        });

        Schema::create('system_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('leads');
    }
};
