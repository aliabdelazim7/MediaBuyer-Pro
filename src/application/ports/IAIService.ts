export interface AutoReplyPromptOptions {
  senderName: string;
  commentMessage: string;
  postContext?: string;
  tone?: 'egyptian_friendly' | 'gulf_polite' | 'formal_arabic' | 'english';
  productDetails?: string;
}

export interface IAIService {
  generateSmartReply(options: AutoReplyPromptOptions): Promise<string>;
  generateCustomPrompt(prompt: string): Promise<string>;
  analyzeCommentDeep(text: string): Promise<{
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'INQUIRY_PRICE' | 'SPAM' | 'NEUTRAL';
    suggestedAction: 'REPLY_PUBLIC' | 'SEND_DM' | 'HIDE' | 'ESCALATE';
    replyDraft: string;
  }>;
}
