<?php

namespace App\Services\Telegram;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected ?string $botToken;
    protected ?string $chatId;
    protected ?Client $client = null;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', env('TELEGRAM_BOT_TOKEN'));
        $this->chatId = config('services.telegram.chat_id', env('TELEGRAM_CHAT_ID'));

        if ($this->botToken) {
            $this->client = new Client([
                'base_uri' => "https://api.telegram.org/bot{$this->botToken}/",
                'timeout' => 10.0,
            ]);
        }
    }

    public function sendMessage(string $htmlText, ?string $overrideChatId = null): bool
    {
        $targetChat = $overrideChatId ?: $this->chatId;

        if (!$this->client || !$targetChat || str_starts_with($targetChat, 'your_')) {
            Log::info("[Telegram Simulation] To: {$targetChat}\n{$htmlText}");
            return true;
        }

        try {
            $this->client->post('sendMessage', [
                'form_params' => [
                    'chat_id' => $targetChat,
                    'text' => $htmlText,
                    'parse_mode' => 'HTML',
                ],
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('Telegram API error: ' . $e->getMessage());
            return false;
        }
    }
}
