import { ITelegramClient, SendMessageOptions } from '../../application/ports/ITelegramClient';

export class TelegramBotClient implements ITelegramClient {
  private botToken: string;
  private defaultChatId: string;
  private baseUrl: string;

  constructor(botToken?: string, defaultChatId?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN || '';
    this.defaultChatId = defaultChatId || process.env.TELEGRAM_CHAT_ID || '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  public isConfigured(): boolean {
    return Boolean(this.botToken && this.defaultChatId && this.botToken !== 'your_telegram_bot_token');
  }

  public async sendMessage(text: string, options?: SendMessageOptions): Promise<boolean> {
    const targetChatId = options?.chatId || this.defaultChatId;

    if (!this.isConfigured() || !targetChatId) {
      console.log(`[Telegram Simulation] To: ${targetChatId || 'Unset'}\n${text}`);
      return true;
    }

    try {
      const url = `${this.baseUrl}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text,
          parse_mode: options?.parseMode || 'HTML',
          reply_markup: options?.replyMarkup,
        }),
      });

      if (!res.ok) {
        console.error(`Telegram API Error: ${res.statusText}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to send Telegram message:', err);
      return false;
    }
  }

  public async sendAlertWithActions(
    title: string,
    body: string,
    actions: Array<{ label: string; actionKey: string; payload: string }>
  ): Promise<boolean> {
    const formattedText = `🚨 <b>${title}</b>\n\n${body}`;

    const inlineKeyboard = [
      actions.map((act) => ({
        text: act.label,
        callback_data: `${act.actionKey}:${act.payload}`,
      })),
    ];

    return this.sendMessage(formattedText, {
      parseMode: 'HTML',
      replyMarkup: {
        inline_keyboard: inlineKeyboard,
      },
    });
  }
}
