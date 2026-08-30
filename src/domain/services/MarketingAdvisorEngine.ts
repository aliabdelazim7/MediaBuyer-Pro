export interface UnitEconomicsInput {
  sellingPrice: number;
  productCost: number;
  shippingAndFulfillment?: number;
  packagingAndConfirmation?: number;
  returnRatePercent?: number; // e.g. 10 for 10%
}

export interface UnitEconomicsOutput {
  sellingPrice: number;
  grossMarginPercent: number;
  netProfitBeforeMarketing: number;
  breakEvenRoas: number;
  maxAllowableCpa: number;
  targetCpa: number;
  recommendedBudgetPerAdSet: number;
}

export interface CampaignHealthMetric {
  id: string;
  name: string;
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
  ctr: number;
  cpm: number;
}

export interface AdvisoryDiagnosis {
  overallHealthScore: number; // 0 to 100
  overallVerdict: 'EXCELLENT' | 'STABLE' | 'NEEDS_OPTIMIZATION' | 'CRITICAL_RISK';
  summaryVerdictArabic: string;
  breakEvenRoas: number;
  scalingOpportunities: Array<{
    campaignId: string;
    campaignName: string;
    reason: string;
    action: string;
    actionType: 'BOOST_BUDGET' | 'DUPLICATE_WINNER';
    suggestedBudgetIncreasePercent: number;
  }>;
  criticalAlerts: Array<{
    campaignId: string;
    campaignName: string;
    reason: string;
    recommendedAction: string;
    actionType: 'PAUSE' | 'DECREASE_BUDGET';
    cpaVsTargetRatio: number;
  }>;
  creativeFatigueWarnings: Array<{
    campaignId: string;
    campaignName: string;
    reason: string;
    recommendedCreativeAngle: string;
  }>;
  cmoTacticalRecommendations: string[];
}

export interface ViralHook {
  hookType: string;
  hookText: string;
  angle: 'PAIN_RELIEF' | 'CURIOSITY' | 'SOCIAL_PROOF' | 'PRICE_VALUE' | 'SHOCK_PATTERN';
  visualCue: string;
}

export interface UGCScriptScene {
  timing: string;
  visual: string;
  spokenAudio: string;
  onScreenTextAndSfx: string;
}

export class MarketingAdvisorEngine {
  public calculateUnitEconomics(input: UnitEconomicsInput): UnitEconomicsOutput {
    const price = Math.max(1, input.sellingPrice);
    const cogs = Math.max(0, input.productCost);
    const shipping = Math.max(0, input.shippingAndFulfillment || 0);
    const packaging = Math.max(0, input.packagingAndConfirmation || 0);
    const returnRate = Math.max(0, Math.min(50, input.returnRatePercent || 0)) / 100;

    // Loss from return rate on shipping & inventory
    const returnLoss = price * returnRate;

    const netProfitBeforeMarketing = Math.max(1, price - cogs - shipping - packaging - returnLoss);
    const grossMarginPercent = Number(((netProfitBeforeMarketing / price) * 100).toFixed(1));

    // Break-even ROAS = Selling Price / Net Profit Before Marketing
    const breakEvenRoas = Number((price / netProfitBeforeMarketing).toFixed(2));
    const maxAllowableCpa = Number(netProfitBeforeMarketing.toFixed(2));

    // Target CPA aiming for at least 30-40% net business profit after ads
    const targetCpa = Number((maxAllowableCpa * 0.65).toFixed(2));

    // Recommended daily budget per Ad Set = 3x Target CPA to exit Learning Phase cleanly
    const recommendedBudgetPerAdSet = Number((targetCpa * 3).toFixed(2));

    return {
      sellingPrice: price,
      grossMarginPercent,
      netProfitBeforeMarketing,
      breakEvenRoas,
      maxAllowableCpa,
      targetCpa,
      recommendedBudgetPerAdSet,
    };
  }

  public diagnosePortfolioHealth(
    campaigns: CampaignHealthMetric[],
    benchmarks: { targetRoas?: number; targetCpa?: number; breakEvenRoas?: number } = {}
  ): AdvisoryDiagnosis {
    const targetRoas = benchmarks.targetRoas || 3.0;
    const targetCpa = benchmarks.targetCpa || 15.0;
    const breakEvenRoas = benchmarks.breakEvenRoas || 2.5;

    const scalingOpportunities: AdvisoryDiagnosis['scalingOpportunities'] = [];
    const criticalAlerts: AdvisoryDiagnosis['criticalAlerts'] = [];
    const creativeFatigueWarnings: AdvisoryDiagnosis['creativeFatigueWarnings'] = [];
    const tacticalRecommendations: string[] = [];

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalConversions = 0;

    for (const c of campaigns) {
      totalSpend += c.spend;
      totalRevenue += c.spend * c.roas;
      totalConversions += c.conversions;

      // 1. Check Scaling Opportunity (Winner Campaign)
      if (c.roas >= targetRoas && (c.cpa <= targetCpa || c.conversions >= 10)) {
        scalingOpportunities.push({
          campaignId: c.id,
          campaignName: c.name,
          reason: `تحقق ROAS ممتاز (${c.roas.toFixed(2)}x) مع تكلفة تحويل رابحة ($${c.cpa.toFixed(2)}).`,
          action: 'ارفع الميزانية اليومية بنسبة 20% فوراً، وقم بتكرار أفضل إعلان في جمهور موازٍ (Horizontal Scaling).',
          actionType: 'BOOST_BUDGET',
          suggestedBudgetIncreasePercent: 20,
        });
      }

      // 2. Check Critical Bleeders (Losing Campaign)
      if (c.spend >= 30 && (c.roas < breakEvenRoas || c.cpa > targetCpa * 1.6)) {
        const ratio = targetCpa > 0 ? Number((c.cpa / targetCpa).toFixed(1)) : 2.0;
        criticalAlerts.push({
          campaignId: c.id,
          campaignName: c.name,
          reason: `الحملة تستنزف الميزانية: الـ CPA ($${c.cpa.toFixed(2)}) أعلى من الهدف بمقدار ${ratio}x، والـ ROAS (${c.roas.toFixed(2)}x) أقل من نقطة التعادل.`,
          recommendedAction: 'إيقاف فوري (Kill-Switch) لمنع نزيف الأرباح، أو مراجعة صفحة الهبوط والعرض فوراً.',
          actionType: 'PAUSE',
          cpaVsTargetRatio: ratio,
        });
      }

      // 3. Check Creative Fatigue
      if (c.spend >= 25 && (c.ctr < 1.2 || c.cpm > 5.0)) {
        creativeFatigueWarnings.push({
          campaignId: c.id,
          campaignName: c.name,
          reason: `نسبة النقر CTR منخفضة (${c.ctr.toFixed(2)}%) مع ارتفاع في تكلفة الظهور، مما يشير إلى ملل الجمهور من الكرييتف الحالي (Ad Fatigue).`,
          recommendedCreativeAngle: 'اختبار فيديو UGC جديد مع هوك بصري صادم في أول ثانيتين.',
        });
      }
    }

    const portfolioRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const portfolioCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

    let overallHealthScore = 75;
    let overallVerdict: AdvisoryDiagnosis['overallVerdict'] = 'STABLE';
    let summaryVerdictArabic = 'أداء الحساب مستقر مع وجود فرص توسع وتحسينات كرييتف.';

    if (criticalAlerts.length > scalingOpportunities.length) {
      overallHealthScore = 45;
      overallVerdict = 'CRITICAL_RISK';
      summaryVerdictArabic = '⚠️ تحذير مالي: توجد حملات خاسرة تستنزف أرباح الحملات الناجحة، يُنصح بتطبيق الـ Kill-Switch فوراً.';
    } else if (scalingOpportunities.length > 0 && criticalAlerts.length === 0) {
      overallHealthScore = 95;
      overallVerdict = 'EXCELLENT';
      summaryVerdictArabic = '🔥 أداء ناري: الحملات تحقق عوائد ممتازة وهناك فرصة ذهبية لزيادة الميزانية ومضاعفة المبيعات اليومية.';
    }

    // Tactical CMO Notes
    if (scalingOpportunities.length > 0) {
      tacticalRecommendations.push(`🚀 لديك ${scalingOpportunities.length} حملات رابحة جاهزة للتوسيع (Scaling). لا ترفع الميزانية أكثر من 20-30% يومياً للحفاظ على استقرار خوارزمية Meta.`);
    }
    if (criticalAlerts.length > 0) {
      tacticalRecommendations.push(`🛑 أوقف فوراً الحملات الخاسرة (${criticalAlerts.length} حملات). توفير هذا الصرف سيضخ أرباحاً صافية في جيبك مباشرة.`);
    }
    if (creativeFatigueWarnings.length > 0) {
      tacticalRecommendations.push(`🎨 قم بتجهيز 3 فيديوهات UGC جديدة بهوكات مختلفة لإنعاش الحملات التي تعاني من هبوط نسبة النقر.`);
    }
    tacticalRecommendations.push(`💡 تذكر قاعدة الـ 70/20/10: خصص 70% من الميزانية للزوايا المثبتة، 20% لاختبار كرييتف جديد، و 10% لاختبار عروض وجماهير جديدة.`);

    return {
      overallHealthScore,
      overallVerdict,
      summaryVerdictArabic,
      breakEvenRoas,
      scalingOpportunities,
      criticalAlerts,
      creativeFatigueWarnings,
      cmoTacticalRecommendations: tacticalRecommendations,
    };
  }

  public generateViralHooks(input: {
    productName: string;
    targetMarket?: 'EGYPT' | 'SAUDI' | 'GCC' | 'GLOBAL';
    mainBenefit: string;
    painPoint: string;
  }): ViralHook[] {
    const { productName, targetMarket = 'EGYPT', mainBenefit, painPoint } = input;
    const isSaudi = targetMarket === 'SAUDI' || targetMarket === 'GCC';

    if (isSaudi) {
      return [
        {
          hookType: 'خطاف الصدمة والتحذير (Pattern Interrupt)',
          hookText: `وقف تصفح ثانية.. لو تدور على ${productName} عشان ${mainBenefit}، انتبه تدفع ضعف السعر بدون ما تفحص هذا الشيء!`,
          angle: 'SHOCK_PATTERN',
          visualCue: 'الشخص يشير بإصبعه للكاميرا مع زووم سريع وتثبيت الشاشة باللون الأحمر.',
        },
        {
          hookType: 'خطاف علاج الألم والمشكلة (Problem-Agitation)',
          hookText: `تعبت من ${painPoint} وما لقيت حل حقيقي؟ شوف كيف حليت المشكلة في 3 ثواني مع ${productName}!`,
          angle: 'PAIN_RELIEF',
          visualCue: 'لقطة توضح المعاناة والإحباط من المشكلة ثم الانتقال للراحة الفورية بعد الاستخدام.',
        },
        {
          hookType: 'خطاف الفضول والسر (Curiosity Gap)',
          hookText: `السالفة باختصار.. هذا هو السر اللي مخلّي ${productName} الأكثر طلباً في السعودية هذا الأسبوع!`,
          angle: 'CURIOSITY',
          visualCue: 'فتح صندوق المنتج (Unboxing) بإضاءة استوديو فاخرة مع صوت مؤثر تشويقي.',
        },
        {
          hookType: 'خطاف التوفير والقيمة (Value / Price Anchor)',
          hookText: `بدل ما تخسر مبالغ في حلول مؤقتة.. ${productName} يوفر عليك أكثر من 50% ويعطيك ${mainBenefit} بجودة تدوم!`,
          angle: 'PRICE_VALUE',
          visualCue: 'مقارنة بصرية بين فاتورتين أو بديلين على الشاشة.',
        },
        {
          hookType: 'خطاف الإثبات الاجتماعي (Social Proof / FOMO)',
          hookText: `أكثر من 10,000 عميل في الرياض وجدة جربوا ${productName}.. تعال شوف تجاربهم الحقيقية بدون مجاملة!`,
          angle: 'SOCIAL_PROOF',
          visualCue: 'عرض شاشة الهاتف مع رسائل تقييمات العملاء في الواتساب وإنستجرام.',
        },
      ];
    }

    // Egyptian Colloquial Hooks (Direct Response & Street Casual)
    return [
      {
        hookType: 'خطاف كسر التصفح والصدمة (Scroll Stopper)',
        hookText: `وقف سكرول ثانية! لو بتدور على ${productName} عشان ${mainBenefit}.. متشتريش من أي مكان غير لما تشوف الفيديو ده!`,
        angle: 'SHOCK_PATTERN',
        visualCue: 'حركة يد سريعة توقف الشاشة مع صوت صفارة فرامل قوية.',
      },
      {
        hookType: 'خطاف لمس الألم المباشر (Direct Pain Point)',
        hookText: `لو زهقت من ${painPoint} وعايز حل نهائي يريح بالك، الـ ${productName} ده معمول مخصوص عشانك!`,
        angle: 'PAIN_RELIEF',
        visualCue: 'تعبير وجه يظهر الضيق من المشكلة ثم الابتسامة المريحة بعد تجربة المنتج.',
      },
      {
        hookType: 'خطاف السر اللي محدش هيقولهولك (Curiosity Gap)',
        hookText: `السر اللي معظم الصفحات مخبياه عن ${productName}.. وليه هو تريند في مصر اليومين دول؟`,
        angle: 'CURIOSITY',
        visualCue: 'اقتراب الكاميرا ببطء كأن المتحدث يهمس بسر مهم مع موسيقى تشويقية.',
      },
      {
        hookType: 'خطاف مقارنة القيمة والتوفير (Price-to-Value Anchor)',
        hookText: `بدل ما تدفع مبالغ خيالية في منتجات تانية.. وفر نص فلوسك وخد ${mainBenefit} مع ${productName}!`,
        angle: 'PRICE_VALUE',
        visualCue: 'إمساك المنتج وعرض تفاصيل الخامة والجودة العالية عن قرب مع نص سعر العرض.',
      },
      {
        hookType: 'خطاف المصداقية ورأي الناس (Social Proof)',
        hookText: `شوف ليه أكتر من 3000 عميل في مصر طلبوا ${productName} الأسبوع ده وكتبوا الريفيوهات دي!`,
        angle: 'SOCIAL_PROOF',
        visualCue: 'عرض شاشة مليانة سكرين شوتس لتعليقات ورسائل عملاء حقيقيين يشكرون في المنتج.',
      },
    ];
  }

  public generateUGCScript(productName: string, mainBenefit: string, painPoint: string, market: string = 'EGYPT'): UGCScriptScene[] {
    const isSaudi = market === 'SAUDI' || market === 'GCC';

    if (isSaudi) {
      return [
        {
          timing: '0:00 - 0:03',
          visual: 'المتحدث ينظر للكاميرا مباشرة ويمسك المنتج بيده مع حركة زووم سريعة.',
          spokenAudio: `لو تعاني من ${painPoint}، وقف دقيقة وشوف هذا الفيديو!`,
          onScreenTextAndSfx: 'صوت Whoosh سريع | نص كبير: ⚠️ وقف دقيقة!',
        },
        {
          timing: '0:03 - 0:15',
          visual: 'لقطات سريعة B-roll توضح المشكلة الحالية والإحباط.',
          spokenAudio: `أنا شخصياً جربت كل الحلول وما فادتني، لحد ما جربت ${productName} وتغيرت التجربة تماماً.`,
          onScreenTextAndSfx: 'صوت Pop مع رسم سهم يشير للمشكلة.',
        },
        {
          timing: '0:15 - 0:35',
          visual: 'استعراض عملي للمنتج وتجربة حية للميزة الأساسية.',
          spokenAudio: `الشيء الممتاز إنه يعطيك ${mainBenefit} من أول استخدام وبجودة عالية جداً وتوصيل سريع لباب بيتك والدفع عند الاستلام متاح!`,
          onScreenTextAndSfx: 'موسيقى خلفية حماسية | نصوص بارزة للمزايا مع علامة ✅.',
        },
        {
          timing: '0:35 - 0:45',
          visual: 'المتحدث يبتسم ويوجه إصبعه للأسفل مع عرض باقة الخصم.',
          spokenAudio: `الحين عندهم عرض خاص لفترة محدودة، اطلب الحين من الرابط تحت واستفيد من الخصم والتوصيل السريع!`,
          onScreenTextAndSfx: 'صوت رنين جرس | نص: 🚀 اطلب الحين قبل انتهاء العرض!',
        },
      ];
    }

    return [
      {
        timing: '0:00 - 0:03',
        visual: 'حركة يد سريعة نحو الكاميرا مع مشهد غير متوقع للمنتج.',
        spokenAudio: `لو لسه بتعاني من ${painPoint}، فانت غالباً مجربتش الاختراع ده!`,
        onScreenTextAndSfx: 'صوت كسر زجاج أو فرامل | نص بارز: 🛑 استنى ثانية!',
      },
      {
        timing: '0:03 - 0:15',
        visual: 'لقطة توضح المعاناة اليومية ثم الانتقال للمنتج.',
        spokenAudio: `أنا كنت فاكر إن الموضوع ملوش حل، لحد ما طلبت ${productName} والصراحة النتيجة صدمتني!`,
        onScreenTextAndSfx: 'صوت Pop مع تأثير زووم إن سريع.',
      },
      {
        timing: '0:15 - 0:35',
        visual: 'تجربة حية وعرض الخامات والملمس عن قرب.',
        spokenAudio: `المنتج بيقدملك ${mainBenefit} بكل سهولة، والخامة محترمة جداً ومعاك معاينة قبل الاستلام والشحن لحد باب بيتك في يومين!`,
        onScreenTextAndSfx: 'موسيقى ريتم سريع | نص: ✅ معاينة قبل الاستلام | شحن فوري.',
      },
      {
        timing: '0:35 - 0:45',
        visual: 'المتحدث يشير لزر الشراء أو التعليقات مع إظهار كود الخصم.',
        spokenAudio: `الحق اطلب دلوقتي في العرض الخاص واكتب كلمة "تفاصيل" في الكومنتات أو دوس على اللينك تحت وهنبعتلك كود الخصم فوراً!`,
        onScreenTextAndSfx: 'صوت جرس تنبيه | نص: 💬 اكتب "تفاصيل" في الكومنتات!',
      },
    ];
  }
}
