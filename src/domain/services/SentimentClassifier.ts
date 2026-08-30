import { SentimentCategory, IntentCategory } from '../value-objects/Sentiment';

export interface ClassificationResult {
  sentiment: SentimentCategory;
  intent: IntentCategory;
  confidence: number;
  extractedKeywords: string[];
}

export class SentimentClassifier {
  private priceKeywords = [
    'بكام', 'بكم', 'السعر', 'سعر', 'سعره', 'سعرها', 'التكلفة', 'كام', 'price', 'cost',
    'how much', 'تفاصيل', 'المقاس', 'المقاسات', 'الالوان', 'الألوان', 'متاح', 'فين',
    'العنوان', 'الشحن', 'مصاريف الشحن', 'متوفر'
  ];

  private negativeKeywords = [
    'زبالة', 'سيء', 'سيئة', 'نصابين', 'سرقة', 'حرامية', 'تأخير', 'اتأخر', 'وحش',
    'رديء', 'خربان', 'مش شغال', 'مقرف', 'سيء جدا', 'فاشل', 'ضحكوا عليا', 'scam',
    'bad', 'terrible', 'worst', 'fake', 'fake product', 'كسر', 'مكسور', 'تالف'
  ];

  private positiveKeywords = [
    'تحفة', 'جميل', 'ممتاز', 'روعة', 'شكرا', 'شكراً', 'تسلم', 'عاش', 'حلو', 'جامد',
    'ما شاء الله', 'تبارك الله', 'حبايبي', 'ذوق', 'محترمين', 'great', 'awesome',
    'love', 'best', 'good', 'perfect', 'أحسن ناس', 'وصلت وممتازة'
  ];

  private spamKeywords = [
    'اضغط على الرابط', 'تابعوا صفحتي', 'اربح معنا', 'فرصة عمل من المنزل', 'شغل اونلاين',
    'دولار يوميا', 'www.', 'http://', 'https://', 'bit.ly', 'wa.me', 'تسجيل مجاني',
    'ربح مجاني', 'تابع حسابي', 'لكل من يعاني'
  ];

  public classify(text: string): ClassificationResult {
    if (!text || typeof text !== 'string') {
      return {
        sentiment: 'NEUTRAL',
        intent: 'GENERAL',
        confidence: 1.0,
        extractedKeywords: [],
      };
    }

    const cleanText = text.toLowerCase().trim();
    const matchedKeywords: string[] = [];

    // 1. Check Spam First
    for (const kw of this.spamKeywords) {
      if (cleanText.includes(kw)) {
        matchedKeywords.push(kw);
      }
    }
    if (matchedKeywords.length > 0) {
      return {
        sentiment: 'SPAM',
        intent: 'SPAM',
        confidence: 0.95,
        extractedKeywords: matchedKeywords,
      };
    }

    // 2. Check Negative / Complaints
    for (const kw of this.negativeKeywords) {
      if (cleanText.includes(kw)) {
        matchedKeywords.push(kw);
      }
    }
    if (matchedKeywords.length > 0) {
      return {
        sentiment: 'NEGATIVE',
        intent: 'COMPLAINT',
        confidence: 0.9,
        extractedKeywords: matchedKeywords,
      };
    }

    // 3. Check Price / Inquiry
    for (const kw of this.priceKeywords) {
      if (cleanText.includes(kw)) {
        matchedKeywords.push(kw);
      }
    }
    if (matchedKeywords.length > 0) {
      return {
        sentiment: 'INQUIRY_PRICE',
        intent: 'PRICE_INQUIRY',
        confidence: 0.9,
        extractedKeywords: matchedKeywords,
      };
    }

    // 4. Check Positive
    for (const kw of this.positiveKeywords) {
      if (cleanText.includes(kw)) {
        matchedKeywords.push(kw);
      }
    }
    if (matchedKeywords.length > 0) {
      return {
        sentiment: 'POSITIVE',
        intent: 'PRAISE',
        confidence: 0.85,
        extractedKeywords: matchedKeywords,
      };
    }

    // Default: Neutral General
    return {
      sentiment: 'NEUTRAL',
      intent: 'GENERAL',
      confidence: 0.7,
      extractedKeywords: [],
    };
  }
}
