<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ChatMessage;
use App\Models\Lead;
use App\Services\AI\SentimentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConversationController extends Controller
{
    public function __construct(
        protected SentimentService $sentimentService
    ) {}

    public function index(Request $request)
    {
        $platform = $request->query('platform', 'ALL');
        $page = $request->query('page', 'ALL');

        $query = Conversation::with('messages')->latest('last_message_at');

        if ($platform !== 'ALL') {
            $query->where('platform', $platform);
        }
        if ($page !== 'ALL') {
            $query->where('page_name', $page);
        }

        $conversations = $query->get();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'conversations' => $conversations,
            ]);
        }

        return view('inbox.index', compact('conversations'));
    }

    public function show(string $id): JsonResponse
    {
        $conversation = Conversation::with('messages')->findOrFail($id);
        $conversation->update(['unread_count' => 0]);

        return response()->json([
            'success' => true,
            'conversation' => $conversation,
        ]);
    }

    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $request->validate(['text' => 'required|string']);
        $conversation = Conversation::findOrFail($id);
        $text = $request->input('text');

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'AGENT',
            'text' => $text,
            'is_read' => true,
        ]);

        $conversation->update([
            'last_message_text' => $text,
            'last_message_at' => now(),
            'unread_count' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    public function generateAiDraft(string $id): JsonResponse
    {
        $conversation = Conversation::with('messages')->findOrFail($id);
        $lastCustomerMsg = $conversation->messages->where('sender_type', 'CUSTOMER')->last()?->text ?? $conversation->last_message_text;

        $draft = $this->sentimentService->generateSmartReply(
            $lastCustomerMsg,
            $conversation->sender_name,
            $conversation->page_name
        );

        return response()->json([
            'success' => true,
            'aiDraft' => $draft,
        ]);
    }

    public function convertToLead(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);

        $lead = Lead::create([
            'name' => $conversation->sender_name,
            'source' => "{$conversation->page_name} ({$conversation->platform})",
            'stage' => 'NEW',
            'deal_value' => $request->input('dealValue', 500),
            'currency' => 'EGP',
            'notes' => "تحويل مباشر من محادثة: \"{$conversation->last_message_text}\"",
        ]);

        $conversation->update(['lead_id' => $lead->id]);

        return response()->json([
            'success' => true,
            'lead' => $lead,
            'message' => "تم تحويل العميل ({$lead->name}) إلى مسار مبيعات الـ CRM بنجاح!",
        ]);
    }
}
