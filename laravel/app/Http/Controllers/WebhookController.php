<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\SocialPage;
use App\Models\Conversation;
use App\Models\ChatMessage;
use App\Services\AI\SentimentService;
use App\Services\Telegram\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WebhookController extends Controller
{
    public function __construct(
        protected SentimentService $sentimentService,
        protected TelegramService $telegramService
    ) {}

    /**
     * Meta Webhook Verification (GET)
     */
    public function verifyMeta(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $expectedToken = config('services.meta.verify_token', env('META_WEBHOOK_VERIFY_TOKEN', 'crm_secret_verify_token_2026'));

        if ($mode === 'subscribe' && $token === $expectedToken) {
            return response($challenge, 200);
        }

        return response('Forbidden', 403);
    }

    /**
     * Meta Webhook Ingestion (POST) for comments & messages
     */
    public function handleMeta(Request $request)
    {
        $payload = $request->all();

        // 1. Process Feed Comments
        if (isset($payload['entry'])) {
            foreach ($payload['entry'] as $entry) {
                if (isset($entry['changes'])) {
                    foreach ($entry['changes'] as $change) {
                        if ($change['field'] === 'feed' && ($change['value']['item'] ?? '') === 'comment') {
                            $val = $change['value'];
                            $pageId = $entry['id'] ?? '';
                            $page = SocialPage::where('page_id', $pageId)->first();

                            if ($page) {
                                $text = $val['message'] ?? '';
                                $senderName = $val['from']['name'] ?? 'عميل';
                                $senderId = $val['from']['id'] ?? 'user_id';
                                $classification = $this->sentimentService->classify($text);

                                Comment::updateOrCreate(
                                    ['comment_id' => $val['comment_id']],
                                    [
                                        'page_id' => $page->id,
                                        'post_id' => $val['post_id'] ?? 'post',
                                        'sender_name' => $senderName,
                                        'sender_id' => $senderId,
                                        'message' => $text,
                                        'sentiment' => $classification['sentiment'],
                                        'intent' => $classification['intent'],
                                    ]
                                );

                                if ($classification['sentiment'] === 'INQUIRY_PRICE') {
                                    $html = "🚨 <b>🔥 عميل يسأل عن السعر على صفحة {$page->name}</b>\n\n"
                                          . "<b>العميل:</b> {$senderName}\n"
                                          . "<b>التعليق:</b> \"{$text}\"";
                                    $this->telegramService->sendMessage($html);
                                }
                            }
                        }
                    }
                }

                // 2. Process Messenger Messages
                if (isset($entry['messaging'])) {
                    foreach ($entry['messaging'] as $msgEvent) {
                        if (isset($msgEvent['message']['text'])) {
                            $senderId = $msgEvent['sender']['id'];
                            $recipientId = $msgEvent['recipient']['id'];
                            $text = $msgEvent['message']['text'];
                            $page = SocialPage::where('page_id', $recipientId)->first();

                            $conversation = Conversation::firstOrCreate(
                                ['platform_thread_id' => "fb_{$senderId}_{$recipientId}"],
                                [
                                    'platform' => 'MESSENGER',
                                    'sender_name' => 'عميل فيسبوك',
                                    'sender_id' => $senderId,
                                    'page_name' => $page?->name ?? 'الصفحة الرسمية',
                                    'last_message_text' => $text,
                                ]
                            );

                            $conversation->update([
                                'last_message_text' => $text,
                                'last_message_at' => now(),
                                'unread_count' => $conversation->unread_count + 1,
                            ]);

                            ChatMessage::create([
                                'conversation_id' => $conversation->id,
                                'sender_type' => 'CUSTOMER',
                                'text' => $text,
                                'is_read' => false,
                            ]);
                        }
                    }
                }
            }
        }

        return response()->json(['status' => 'EVENT_RECEIVED']);
    }
}
