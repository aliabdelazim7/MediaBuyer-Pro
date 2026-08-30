import { prisma } from '../../infrastructure/db/prisma';
import { MarketingAdvisorEngine, UnitEconomicsInput } from '../../domain/services/MarketingAdvisorEngine';
import { CMOAdvisorBrain, BrainChatInput } from '../../domain/services/CMOAdvisorBrain';
import { AIService } from '../../infrastructure/ai/AIService';

export class AnalyzeMarketingStrategyUseCase {
  private advisorEngine: MarketingAdvisorEngine;
  private advisorBrain: CMOAdvisorBrain;
  private aiService: AIService;

  constructor() {
    this.advisorEngine = new MarketingAdvisorEngine();
    this.advisorBrain = new CMOAdvisorBrain();
    this.aiService = new AIService();
  }

  public async execute(portfolioId?: string, unitEconomics?: UnitEconomicsInput) {
    let whereClause: any = {};
    if (portfolioId && portfolioId !== 'ALL') {
      whereClause = {
        adAccount: {
          businessPortfolioId: portfolioId,
        },
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      orderBy: { spend: 'desc' },
    });

    const metrics = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      spend: c.spend,
      conversions: c.conversions,
      cpa: c.cpa,
      roas: c.roas,
      ctr: c.ctr,
      cpm: c.cpm,
    }));

    // Calculate unit economics if provided or use standard E-Commerce benchmark
    const economics = this.advisorEngine.calculateUnitEconomics(
      unitEconomics || {
        sellingPrice: 450,
        productCost: 180,
        shippingAndFulfillment: 45,
        packagingAndConfirmation: 20,
        returnRatePercent: 12,
      }
    );

    const diagnosis = this.advisorEngine.diagnosePortfolioHealth(metrics, {
      breakEvenRoas: economics.breakEvenRoas,
      targetCpa: economics.targetCpa,
      targetRoas: 3.2,
    });

    // Generate sample winning hooks & scripts based on the active portfolio
    const sampleHooks = this.advisorEngine.generateViralHooks({
      productName: 'المنتج البطل (Winner Product)',
      targetMarket: portfolioId?.includes('gulf') || portfolioId?.includes('202') ? 'SAUDI' : 'EGYPT',
      mainBenefit: 'أعلى جودة بأفضل سعر مع شحن فوري ومعاينة قبل الاستلام',
      painPoint: 'الخامات الرديئة والتأخير في التوصيل والأسعار المبالغ فيها',
    });

    const sampleScript = this.advisorEngine.generateUGCScript(
      'المنتج البطل',
      'خامة بريميوم وتجربة استخدام ممتازة مع خصم خاص',
      'تضييع الفلوس في منتجات بدون ضمان',
      portfolioId?.includes('gulf') || portfolioId?.includes('202') ? 'SAUDI' : 'EGYPT'
    );

    return {
      economics,
      diagnosis,
      sampleHooks,
      sampleScript,
      campaignsCount: campaigns.length,
    };
  }

  public async askCMO(input: {
    question: string;
    history?: Array<{ sender: 'USER' | 'CMO'; text: string }>;
    portfolioId?: string;
  }): Promise<string> {
    const { question, history = [], portfolioId } = input;

    // 1. Fetch real live campaigns from the database
    let whereClause: any = {};
    if (portfolioId && portfolioId !== 'ALL') {
      whereClause = {
        adAccount: {
          businessPortfolioId: portfolioId,
        },
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      orderBy: { spend: 'desc' },
    });

    const brainCampaigns = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      spend: c.spend,
      conversions: c.conversions,
      cpa: c.cpa,
      roas: c.roas,
      ctr: c.ctr,
      cpm: c.cpm,
      dailyBudget: c.dailyBudget,
    }));

    // Find active portfolio name if available
    let portfolioName = 'كافة البيزنس بورتفوليو';
    if (portfolioId && portfolioId !== 'ALL') {
      const port = await prisma.businessPortfolio.findUnique({ where: { id: portfolioId } });
      if (port) portfolioName = port.name;
    }

    // 2. If Gemini API key is available, prepare rich structured system prompt with knowledge base
    if (process.env.GEMINI_API_KEY) {
      const liveCampaignsSummary = brainCampaigns
        .map(
          (c) =>
            `- حملة "${c.name}" [حالة: ${c.status}]: صرف $${c.spend} | مبيعات: ${c.conversions} | CPA: $${c.cpa} | ROAS: ${c.roas}x | CTR: ${c.ctr}% | الميزانية اليومية: $${c.dailyBudget}/يوم`
        )
        .join('\n');

      const historyFormatted = history
        .map((h) => `${h.sender === 'USER' ? 'العميل' : 'الـ CMO'}: ${h.text}`)
        .join('\n');

      const prompt = `
أنت الآن تعمل كـ Chief Marketing Officer (CMO) ومدير نمو تنفيذي وخبير ميديا باينج للمتاجر الإلكترونية في مصر والخليج (خبرة 20+ سنة).
تحدث باللغة العربية بأسلوب عملي، واقعي، مبني على الأرقام، خالي من أي ركاكة روبوتية أو كلام إنشائي مكرر.

بيانات الحساب الإعلاني الحقيقية المباشرة من قاعدة البيانات:
اسم البورتفوليو: ${portfolioName}
الحملات الإعلانية الحالية:
${liveCampaignsSummary || 'لا توجد حملات مسجلة حالياً'}

سجل المحادثة السابقة:
${historyFormatted || 'بداية المحادثة'}

رسالة المستخدم الأخيرة:
"${question}"

المطلوب:
1. جاوب على رسالة العميل بشكل مباشر ودقيق ومخصص جداً لما كتبه ومرتبط بأرقام حملاته الحقيقية المذكورة أعلاه.
2. لو بيشتكي من النتائج، وضح له بالاسم الحملات الخاسرة وكيفية علاجها فوراً.
3. لو بيطلب أفكار وفيديوهات أو سكريبت، اكتب له هوكات عامية حية وسيناريوهات تصوير بدون كلام ميت.
4. لو بيسأل عن دولة معينة (السعودية أو مصر أو الخليج)، اعطه خصوصية السوق وطرق الدفع (مدى، تابي، تكييد الواتساب).
`;

      try {
        const response = await this.aiService.generateCustomPrompt(prompt);
        if (response && response.trim().length > 30) {
          return response;
        }
      } catch (err) {
        console.warn('AI custom prompt failed, using CMOAdvisorBrain engine fallback:', err);
      }
    }

    // 3. Ultra-Smart Local Heuristics & Knowledge Brain Engine
    return this.advisorBrain.generateResponse({
      userMessage: question,
      history,
      campaigns: brainCampaigns,
      portfolioName,
    });
  }
}
