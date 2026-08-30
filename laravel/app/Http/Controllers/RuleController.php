<?php

namespace App\Http\Controllers;

use App\Models\AutomationRule;
use App\Models\RuleLog;
use App\Services\Rules\RuleEvaluatorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RuleController extends Controller
{
    public function __construct(
        protected RuleEvaluatorService $evaluatorService
    ) {}

    public function index(Request $request)
    {
        $rules = AutomationRule::with('logs')->latest()->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'rules' => $rules,
            ]);
        }

        return view('rules.index', compact('rules'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'metric' => 'required|string',
            'operator' => 'required|string',
            'threshold' => 'required|numeric',
            'action' => 'required|string',
            'actionParam' => 'nullable|numeric',
            'minSpendCondition' => 'nullable|numeric',
            'minConversionsCondition' => 'nullable|integer',
            'notifyTelegram' => 'nullable|boolean',
        ]);

        $rule = AutomationRule::create([
            'name' => $validated['name'],
            'metric' => $validated['metric'],
            'operator' => $validated['operator'],
            'threshold' => $validated['threshold'],
            'action' => $validated['action'],
            'action_param' => $validated['actionParam'] ?? 0,
            'min_spend_condition' => $validated['minSpendCondition'] ?? 0,
            'min_conversions_condition' => $validated['minConversionsCondition'] ?? 0,
            'notify_telegram' => $validated['notifyTelegram'] ?? true,
            'is_enabled' => true,
        ]);

        return response()->json(['success' => true, 'rule' => $rule]);
    }

    public function run(): JsonResponse
    {
        $result = $this->evaluatorService->evaluateAll();
        return response()->json($result);
    }

    public function destroy(string $id): JsonResponse
    {
        $rule = AutomationRule::findOrFail($id);
        $rule->delete();
        return response()->json(['success' => true]);
    }
}
