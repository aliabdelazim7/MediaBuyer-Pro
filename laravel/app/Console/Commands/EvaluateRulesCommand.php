<?php

namespace App\Console\Commands;

use App\Services\Rules\RuleEvaluatorService;
use Illuminate\Console\Command;

class EvaluateRulesCommand extends Command
{
    protected $signature = 'rules:evaluate';
    protected $description = 'Evaluates all active auto-pilot rules, stops bleeders, scales winners, and sends Telegram alerts';

    public function handle(RuleEvaluatorService $service): int
    {
        $this->info('Evaluating auto-pilot rules on all campaigns...');
        $result = $service->evaluateAll();

        $this->info("Evaluation completed. Triggered rules: {$result['triggeredCount']}");
        return Command::SUCCESS;
    }
}
