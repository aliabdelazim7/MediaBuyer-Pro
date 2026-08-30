<?php

namespace App\Http\Controllers;

use App\Services\AI\CMOAdvisorService;
use App\Services\Telegram\TelegramService;
use App\Models\FacebookUserAccount;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdvisorController extends Controller
{
    public function __construct(
        protected CMOAdvisorService $advisorService
    ) {}

    public function index(Request $request)
    {
        $portfolioName = $request->query('portfolio');
        $strategy = $this->advisorService->generateStrategy($portfolioName);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'strategy' => $strategy,
            ]);
        }

        return view('advisor.index', compact('strategy'));
    }
}
