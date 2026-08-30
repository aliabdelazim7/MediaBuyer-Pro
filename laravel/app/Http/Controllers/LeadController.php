<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $leads = Lead::latest()->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            $totalValue = $leads->sum('deal_value');
            $wonCount = $leads->where('stage', 'WON')->count();
            $winRate = $leads->count() > 0 ? round(($wonCount / $leads->count()) * 100, 1) : 0;

            return response()->json([
                'success' => true,
                'leads' => $leads,
                'stats' => [
                    'totalLeads' => $leads->count(),
                    'totalPipelineValue' => $totalValue,
                    'winRate' => $winRate,
                ],
            ]);
        }

        return view('leads.index', compact('leads'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'source' => 'nullable|string',
            'dealValue' => 'nullable|numeric',
            'currency' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $lead = Lead::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'source' => $validated['source'] ?? 'COMMENT',
            'deal_value' => $validated['dealValue'] ?? 0,
            'currency' => $validated['currency'] ?? 'EGP',
            'notes' => $validated['notes'] ?? null,
            'stage' => 'NEW',
        ]);

        return response()->json(['success' => true, 'lead' => $lead]);
    }

    public function updateStage(Request $request, string $id): JsonResponse
    {
        $lead = Lead::findOrFail($id);
        $stage = $request->input('stage');

        $lead->update(['stage' => $stage]);

        return response()->json(['success' => true, 'lead' => $lead]);
    }
}
