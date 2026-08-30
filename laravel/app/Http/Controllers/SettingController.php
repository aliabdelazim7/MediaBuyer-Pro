<?php

namespace App\Http\Controllers;

use App\Models\FacebookUserAccount;
use App\Services\Telegram\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(
        protected TelegramService $telegramService
    ) {}

    public function index(Request $request)
    {
        $activeAccount = FacebookUserAccount::where('status', 'ACTIVE')->latest()->first();

        return view('settings.index', compact('activeAccount'));
    }

    public function testTelegram(Request $request): JsonResponse
    {
        $html = "🔔 <b>⚡ اختبار إشعار تليجرام من منظومة MediaBuyer Pro (Laravel 11)</b>\n\n"
              . "✅ تم ربط البوت بنجاح وإرسال هذا التنبيه التجريبي.\n"
              . "⏱ الوقت: " . now()->format('Y-m-d H:i:s');

        $sent = $this->telegramService->sendMessage($html);

        return response()->json([
            'success' => $sent,
            'message' => $sent ? 'تم إرسال إشعار تليجرام بنجاح!' : 'فشل إرسال الإشعار، تحقق من التوكن والـ Chat ID',
        ]);
    }
}
