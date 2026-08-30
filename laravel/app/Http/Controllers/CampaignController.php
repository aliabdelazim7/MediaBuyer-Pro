<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\BusinessPortfolio;
use App\Services\Meta\MetaGraphService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CampaignController extends Controller
{
    public function __construct(
        protected MetaGraphService $metaService
    ) {}

    public function index(Request $request)
    {
        $portfolios = BusinessPortfolio::with(['adAccounts.campaigns'])->get();
        $datePreset = $request->query('datePreset', 'maximum');

        if ($request->wantsJson() || $request->is('api/*')) {
            $campaigns = Campaign::with('adAccount.businessPortfolio')->get();
            return response()->json([
                'success' => true,
                'campaigns' => $campaigns,
                'portfolios' => $portfolios,
            ]);
        }

        return view('campaigns.index', compact('portfolios', 'datePreset'));
    }

    public function sync(Request $request): JsonResponse
    {
        $datePreset = $request->input('datePreset', 'maximum');
        $result = $this->metaService->syncCampaigns($datePreset);
        return response()->json($result);
    }

    public function toggle(Request $request, string $id): JsonResponse
    {
        $campaign = Campaign::findOrFail($id);
        $newStatus = $campaign->status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

        $this->metaService->toggleCampaignStatus($campaign->platform_id, $newStatus);
        $campaign->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'campaign' => $campaign,
            'message' => "تم تحديث حالة الحملة إلى {$newStatus} ومزامنتها مع ميتا بنجاح",
        ]);
    }

    public function updateBudget(Request $request, string $id): JsonResponse
    {
        $request->validate(['dailyBudget' => 'required|numeric|min:1']);
        $campaign = Campaign::findOrFail($id);
        $newBudget = (float)$request->input('dailyBudget');

        $this->metaService->updateBudget($campaign->platform_id, $newBudget);
        $campaign->update(['daily_budget' => $newBudget]);

        return response()->json([
            'success' => true,
            'campaign' => $campaign,
            'message' => "تم تحديث الميزانية إلى {$newBudget} ومزامنتها مع ميتا إعلانات بنجاح",
        ]);
    }
}
