<?php

namespace App\Console\Commands;

use App\Services\Meta\MetaGraphService;
use Illuminate\Console\Command;

class SyncCampaignsCommand extends Command
{
    protected $signature = 'campaigns:sync {--datePreset=maximum : Date range to sync (maximum, today, yesterday, last_7d)}';
    protected $description = 'Syncs campaigns, ad sets, and insights from Meta Graph API';

    public function handle(MetaGraphService $service): int
    {
        $datePreset = $this->option('datePreset') ?: 'maximum';
        $this->info("Syncing campaigns from Meta Graph API (Preset: {$datePreset})...");

        $result = $service->syncCampaigns($datePreset);

        if ($result['success'] ?? false) {
            $this->info("Successfully synced {$result['syncedCount']} campaigns!");
            return Command::SUCCESS;
        }

        $this->error("Sync failed: " . ($result['error'] ?? 'Unknown error'));
        return Command::FAILURE;
    }
}
