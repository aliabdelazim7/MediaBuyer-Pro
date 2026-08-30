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

// Campaigns API
Route::get('/campaigns', [CampaignController::class, 'index']);
Route::post('/campaigns/sync', [CampaignController::class, 'sync']);
Route::post('/campaigns/{id}/toggle', [CampaignController::class, 'toggle']);
Route::post('/campaigns/{id}/budget', [CampaignController::class, 'updateBudget']);

// Unified Inbox API
Route::get('/messages', [ConversationController::class, 'index']);
Route::get('/messages/{id}', [ConversationController::class, 'show']);
Route::post('/messages/{id}/send', [ConversationController::class, 'sendMessage']);
Route::post('/messages/{id}/ai-draft', [ConversationController::class, 'generateAiDraft']);
Route::post('/messages/{id}/convert-to-lead', [ConversationController::class, 'convertToLead']);

// Leads CRM API
Route::get('/leads', [LeadController::class, 'index']);
Route::post('/leads', [LeadController::class, 'store']);
Route::patch('/leads/{id}/stage', [LeadController::class, 'updateStage']);

// Automation Rules API
Route::get('/rules', [RuleController::class, 'index']);
Route::post('/rules', [RuleController::class, 'store']);
Route::post('/rules/run', [RuleController::class, 'run']);
Route::delete('/rules/{id}', [RuleController::class, 'destroy']);

// Moderation API
Route::get('/comments', [ModerationController::class, 'index']);
Route::post('/comments/{id}/reply', [ModerationController::class, 'reply']);

// Multi-Portfolio Hub API
Route::get('/accounts', [AccountController::class, 'index']);
Route::post('/accounts', [AccountController::class, 'store']);
Route::delete('/accounts/{id}', [AccountController::class, 'destroy']);

// CMO Advisor API
Route::get('/advisor', [AdvisorController::class, 'index']);

// Settings & Telegram API
Route::post('/settings/telegram-test', [SettingController::class, 'testTelegram']);
