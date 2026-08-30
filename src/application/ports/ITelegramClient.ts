export interface InlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface SendMessageOptions {
  chatId?: string;
  parseMode?: 'Markdown' | 'HTML';
  replyMarkup?: {
    inline_keyboard: InlineButton[][];
  };
}

export interface ITelegramClient {
  sendMessage(text: string, options?: SendMessageOptions): Promise<boolean>;
  sendAlertWithActions(
    title: string,
    body: string,
    actions: Array<{ label: string; actionKey: string; payload: string }>
  ): Promise<boolean>;
}
