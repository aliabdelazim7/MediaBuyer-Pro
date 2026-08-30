<?php

namespace App\Http\Controllers;

use App\Models\FacebookUserAccount;
use App\Models\BusinessPortfolio;
use App\Services\Meta\MetaGraphService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AccountController extends Controller
{
    public function __construct(
        protected MetaGraphService $metaService
    ) {}

    public function index(Request $request)
    {
        $accounts = FacebookUserAccount::with(['portfolios.adAccounts.campaigns', 'portfolios.pages'])->latest()->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'accounts' => $accounts,
            ]);
        }

        return view('accounts.index', compact('accounts'));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['accessToken' => 'required|string']);
        $token = $request->input('accessToken');

        $result = $this->metaService->discoverAndSyncAccount($token);
        return response()->json($result);
    }

    public function destroy(string $id): JsonResponse
    {
        $acc = FacebookUserAccount::findOrFail($id);
        $acc->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم فصل الحساب بنجاح',
        ]);
    }
}
