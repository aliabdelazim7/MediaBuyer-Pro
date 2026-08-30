<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\RuleController;
use App\Http\Controllers\ModerationController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdvisorController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\WebhookController;

// Web Views
Route::get('/', [CampaignController::class, 'index'])->name('campaigns.index');
Route::get('/inbox', [ConversationController::class, 'index'])->name('inbox.index');
Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
Route::get('/rules', [RuleController::class, 'index'])->name('rules.index');
Route::get('/moderation', [ModerationController::class, 'index'])->name('moderation.index');
Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
Route::get('/advisor', [AdvisorController::class, 'index'])->name('advisor.index');
Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');

// Webhook Endpoints
Route::get('/webhook/meta', [WebhookController::class, 'verifyMeta'])->name('webhook.meta.verify');
Route::post('/webhook/meta', [WebhookController::class, 'handleMeta'])->name('webhook.meta.handle');
