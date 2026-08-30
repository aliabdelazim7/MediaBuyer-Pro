export type SentimentCategory = 'POSITIVE' | 'NEGATIVE' | 'INQUIRY_PRICE' | 'SPAM' | 'NEUTRAL';

export type IntentCategory = 
  | 'PRICE_INQUIRY' 
  | 'COMPLAINT' 
  | 'PRAISE' 
  | 'ORDER' 
  | 'QUESTION' 
  | 'SPAM' 
  | 'GENERAL';

export class Sentiment {
  public readonly category: SentimentCategory;
  public readonly intent: IntentCategory;
  public readonly score: number; // -1.0 to 1.0

  constructor(category: SentimentCategory, intent: IntentCategory, score: number = 0) {
    this.category = category;
    this.intent = intent;
    this.score = Math.max(-1, Math.min(1, score));
  }

  public isHighPriority(): boolean {
    return this.category === 'INQUIRY_PRICE' || this.category === 'NEGATIVE';
  }

  public shouldAutoReply(): boolean {
    return this.category === 'INQUIRY_PRICE' || this.category === 'POSITIVE';
  }

  public shouldHideOrSpam(): boolean {
    return this.category === 'SPAM';
  }
}
