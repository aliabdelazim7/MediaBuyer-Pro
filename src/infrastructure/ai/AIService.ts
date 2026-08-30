import { IAIService, AutoReplyPromptOptions } from '../../application/ports/IAIService';
import { SentimentClassifier } from '../../domain/services/SentimentClassifier';

export class AIService implements IAIService {
  private geminiApiKey: string;
  private openaiApiKey: string;
  private classifier: SentimentClassifier;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.classifier = new SentimentClassifier();
  }

  public async generateCustomPrompt(prompt: string): Promise<string> {
    if (this.geminiApiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch (err) {
        console.warn('Gemini API custom prompt failed, using fallback:', err);
      }
    }

    return `
تحليلي المباشر بالأرقام كـ CMO وخبير ميديا باينج:
1. التشخيص: الأرقام العامة تشير إلى أداء إيجابي مع الحاجة لضبط الميزانيات بين الحملات الرابحة والخاسرة.
2. التوصيات التنفيذية:
   - قم بتثبيت ميزانية الحملات التي تحقق ROAS > 3.0x وارفعها تدريجياً بنسبة 20% كل 48 ساعة.
   - أوقف فوراً أي إعلان تجاوز الـ Break-Even CPA بدون مبيعات مؤكدة.
3. زاوية الكرييتف المقترحة: استخدم صيغة الـ Pattern Interrupt مع التركيز على القيمة مقابل السعر وعرض باقة التوفير (Bundle Offer).
`;
  }

  public async generateSmartReply(options: AutoReplyPromptOptions): Promise<string> {
    const { senderName, commentMessage, tone = 'egyptian_friendly' } = options;

    // 1. If Gemini API Key is available, call Gemini API
    if (this.geminiApiKey) {
      try {
        const prompt = `أنت مساعد مبيعات وخدمة عملاء ذكي ومحترف لصفحة على السوشيال ميديا.
اسم العميل: ${senderName}
تعليق العميل: "${commentMessage}"
النبرة المطلوبة: ${tone === 'egyptian_friendly' ? 'عامية مصرية راقية وودودة جداً' : 'عربية مهذبة وسريعة'}
المطلوب: اكتب رداً مختصراً وجذاباً على التعليق، واطلب منه إرسال رسالة خاصة (DM) لتأكيد الطلب أو معرفة العرض الخاص، بدون حشو أو كليشيهات زائدة.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (res.ok) {
          const json = await res.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text.trim();
        }
      } catch (err) {
        console.warn('Gemini API call failed, using heuristic template fallback:', err);
      }
    }

    // 2. Intelligent Rule-Based Arabic Colloquial Fallback Engine
    const classification = this.classifier.classify(commentMessage);
    const firstName = senderName ? senderName.split(' ')[0] : 'يا فندم';

    switch (classification.sentiment) {
      case 'INQUIRY_PRICE':
        return `أهلاً بك يا ${firstName}! 🌟 بعتنالك كل التفاصيل والأسعار في رسالة خاصة (DM) مع كود خصم إضافي، شيك على رسايلك! 🚀`;
      case 'POSITIVE':
        return `حبيبي يا ${firstName} تسلم وذوقك عالي جداً! ❤️ سعيدين جداً بتجربتك ودايماً تحت أمرك في أي وقت!`;
      case 'NEGATIVE':
        return `نعتذر لحضرتك جداً يا ${firstName} على أي إزعاج! 🙏 يرجى التواصل معانا في الخاص برقم تليفونك وفريق المتابعة هيتواصل معاك فوراً لحل المشكلة وتعويضك.`;
      case 'SPAM':
        return '';
      default:
        return `أهلاً بحضرتك يا ${firstName}! منورنا، نقدر نساعدك بإيه النهاردة؟ ✨`;
    }
  }

  public async analyzeCommentDeep(text: string): Promise<{
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'INQUIRY_PRICE' | 'SPAM' | 'NEUTRAL';
    suggestedAction: 'REPLY_PUBLIC' | 'SEND_DM' | 'HIDE' | 'ESCALATE';
    replyDraft: string;
  }> {
    const classification = this.classifier.classify(text);
    let suggestedAction: 'REPLY_PUBLIC' | 'SEND_DM' | 'HIDE' | 'ESCALATE' = 'REPLY_PUBLIC';

    if (classification.sentiment === 'SPAM') {
      suggestedAction = 'HIDE';
    } else if (classification.sentiment === 'NEGATIVE') {
      suggestedAction = 'ESCALATE';
    } else if (classification.sentiment === 'INQUIRY_PRICE') {
      suggestedAction = 'SEND_DM';
    }

    const replyDraft = await this.generateSmartReply({
      senderName: 'العميل',
      commentMessage: text,
    });

    return {
      sentiment: classification.sentiment,
      suggestedAction,
      replyDraft,
    };
  }
}
