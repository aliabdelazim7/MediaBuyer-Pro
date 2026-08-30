<?php

namespace App\Services\Rules;

use App\Models\AutomationRule;
use App\Models\Campaign;
use App\Models\RuleLog;
use App\Services\Meta\MetaGraphService;
use App\Services\Telegram\TelegramService;
use Illuminate\Support\Facades\Log;

class RuleEvaluatorService
{
    public function __construct(
        protected MetaGraphService $metaService,
        protected TelegramService $telegramService
    ) {}

    public function evaluateAll(): array
    {
        $rules = AutomationRule::where('is_enabled', true)->get();
        $campaigns = Campaign::with('adAccount.businessPortfolio')->get();

        $triggeredCount = 0;
        $logs = [];

        foreach ($rules as $rule) {
            foreach ($campaigns as $campaign) {
                // Preconditions
                if ($rule->min_spend_condition && $campaign->spend < $rule->min_spend_condition) {
                    continue;
                }
                if ($rule->min_conversions_condition && $campaign->conversions < $rule->min_conversions_condition) {
                    continue;
                }

                $metricValue = match ($rule->metric) {
                    'CPA' => $campaign->cpa,
                    'ROAS' => $campaign->roas,
                    'SPEND' => $campaign->spend,
                    'CTR' => $campaign->ctr,
                    'CPM' => $campaign->cpm,
                    'CONVERSIONS' => $campaign->conversions,
                    default => 0,
                };

                $isMatch = match ($rule->operator) {
                    'GREATER_THAN' => $metricValue > $rule->threshold,
                    'LESS_THAN' => $metricValue < $rule->threshold,
                    'EQUALS' => abs($metricValue - $rule->threshold) < 0.001,
                    'GREATER_THAN_OR_EQUAL' => $metricValue >= $rule->threshold,
                    'LESS_THAN_OR_EQUAL' => $metricValue <= $rule->threshold,
                    default => false,
                };

                if ($isMatch) {
                    $triggeredCount++;
                    $actionTaken = '';
                    $reason = "تفعيل القاعدة: {$rule->metric} ({$metricValue}) {$rule->operator} الحد الأقصى ({$rule->threshold})";

                    if ($rule->action === 'PAUSE' && $campaign->status === 'ACTIVE') {
                        $this->metaService->toggleCampaignStatus($campaign->platform_id, 'PAUSED');
                        $campaign->update(['status' => 'PAUSED']);
                        $actionTaken = "🛑 إيقاف الحملة تلقائياً لمنع النزيف: {$campaign->name}";
                    } elseif ($rule->action === 'BOOST_BUDGET' && $rule->action_param > 0) {
                        $newBudget = round($campaign->daily_budget * (1 + $rule->action_param / 100), 2);
                        $this->metaService->updateBudget($campaign->platform_id, $newBudget);
                        $campaign->update(['daily_budget' => $newBudget]);
                        $actionTaken = "🚀 زيادة الميزانية بنسبة +{$rule->action_param}% إلى {$newBudget}";
                    } else {
                        $actionTaken = "⚠️ إرسال تنبيه مراقبة: {$rule->name}";
                    }

                    // Create log
                    $log = RuleLog::create([
                        'rule_id' => $rule->id,
                        'campaign_id' => $campaign->id,
                        'target_name' => $campaign->name,
                        'action_taken' => $actionTaken,
                        'reason' => $reason,
                        'metric_value' => $metricValue,
                    ]);
                    $logs[] = $log;

                    // Telegram Alert
                    if ($rule->notify_telegram) {
                        $currency = $campaign->adAccount?->currency ?? 'USD';
                        $portfolioName = $campaign->adAccount?->businessPortfolio?->name ?? 'حساب إعلاني';

                        $html = "🚨 <b>⚡ تنبيه أوتوبايلوت: {$rule->name}</b>\n\n"
                              . "<b>البورتفوليو:</b> {$portfolioName}\n"
                              . "<b>الحملة:</b> {$campaign->name}\n"
                              . "<b>الإجراء المتخذ:</b> {$actionTaken}\n"
                              . "<b>السبب:</b> {$reason}\n"
                              . "<b>الصرف:</b> {$campaign->spend} {$currency} | <b>CPA:</b> {$campaign->cpa} {$currency} | <b>ROAS:</b> {$campaign->roas}x";

                        $this->telegramService->sendMessage($html);
                    }

                    $rule->update(['last_triggered_at' => now()]);
                }
            }
        }

        return [
            'success' => true,
            'triggeredCount' => $triggeredCount,
            'logs' => $logs,
        ];
    }
}
