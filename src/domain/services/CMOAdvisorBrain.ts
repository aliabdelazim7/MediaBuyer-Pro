export interface BrainCampaignContext {
  id: string;
  name: string;
  status: string;
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
  ctr: number;
  cpm: number;
  dailyBudget?: number;
}

export interface BrainChatInput {
  userMessage: string;
  history: Array<{ sender: 'USER' | 'CMO'; text: string }>;
  campaigns: BrainCampaignContext[];
  portfolioName?: string;
  currency?: string;
}

export class CMOAdvisorBrain {
  public generateResponse(input: BrainChatInput): string {
    const { userMessage, history, campaigns, portfolioName = 'الحساب الإعلاني الرئيسي', currency = 'USD' } = input;
    const msg = userMessage.trim().toLowerCase();

    // 1. Analyze Active Database Campaigns
    const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + c.spend * c.roas, 0);
    const avgRoas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;
    const avgCpa = totalConversions > 0 ? Number((totalSpend / totalConversions).toFixed(2)) : 0;

    const winners = campaigns.filter((c) => c.roas >= 3.0 && c.status === 'ACTIVE');
    const bleeders = campaigns.filter((c) => (c.roas < 2.0 || c.cpa > 25) && c.spend >= 30 && c.status === 'ACTIVE');
    const activeCount = campaigns.filter((c) => c.status === 'ACTIVE').length;

    // Detect last message in history to understand conversational thread
    const previousUserMsg = history.length > 0
      ? history.filter((h) => h.sender === 'USER').slice(-1)[0]?.text.toLowerCase() || ''
      : '';

    // ==========================================
    // Intent 1: Dissatisfaction / Frustration / Follow-up ("مش عجباني", "النتايج وحشة", "حاسس بضيع فلوس")
    // ==========================================
    if (
      msg.includes('مش عجباني') ||
      msg.includes('مش عاجبني') ||
      msg.includes('سيئة') ||
      msg.includes('وحشة') ||
      msg.includes('خسران') ||
      msg.includes('ضيع فلوس') ||
      msg.includes('مش راضي') ||
      msg.includes('ليه كدا')
    ) {
      if (bleeders.length > 0) {
        const topBleeder = bleeders[0];
        const dailyBleedSavings = topBleeder.dailyBudget || 50;
        return `
حقك متكونش راضي، والأرقام بتوضح بالظبط إيه اللي مزعلك:

🔍 **التشخيص المباشر لنزيف الميزانية:**
أكبر مشكلة عندك حالياً هي حملة **"${topBleeder.name}"**:
- صرفت **$${topBleeder.spend.toFixed(2)}** ولم تحقق سوى **${topBleeder.conversions} تحويلات**!
- تكلفة التحويل فيها (CPA) وصلت **$${topBleeder.cpa.toFixed(2)}** وعائدها (ROAS) هو **${topBleeder.roas.toFixed(2)}x** فقط (تحت نقطة التعادل).
- الحملة دي لوحدها بتاكل أرباح الحملات التانية الناجحة!

🛠️ **خطة الإنقاذ الفورية (3 خطوات تنفذهم حالياً):**
1. **🛑 إيقاف ووقف حملة "${topBleeder.name}" فوراً:**
   - الحركة دي لوحدها هتوفر عليك حوالي **$${dailyBleedSavings.toFixed(2)} يومياً** كانت رايحة في الهوا.
2. **🚀 حوّل الميزانية لحملة "${winners[0]?.name || 'الحملة الفائزة'}":**
   - الحملة دي بتحقق ROAS ممتاز (**${winners[0]?.roas.toFixed(2) || '3.5'}x**) وتكلفة شراء رابحة جداً ($${winners[0]?.cpa.toFixed(2) || '6.5'}). ارفع ميزانيتها بنسبة 20%.
3. **🎨 اختبار فيديو إعلاني جديد تماماً (New Angle):**
   - الحملات الخاسرة سببها الرئيسي مش الاستهداف، سببها إن الإعلان مبقاش يشد الناس (Creative Fatigue). جهز فيديو UGC جديد في أول 3 ثواني كسر تصفح قوي وهتشوف الـ CPA بينزل للنص.
`;
      }

      return `
فاهم إحباطك تماماً يا غالي. لما متكونش راضي عن النتائج، فده مؤشر إننا محتاجين نعمل **Reset تكتيكي** سريع:

1. **فحص نسبة التحويل في صفحة الهبوط (CR):**
   - لو الإعلانات بتجيب نقرات رخيصة (CPC منخفض) بس مفيش أوردرات، المشكلة 100% في العرض أو بطء صفحة الشراء أو عدم وجود طمأنة بالدفع عند الاستلام.
2. **إعادة تدوير العرض (Irresistible Offer):**
   - غير العرض من مجرد "خصم 10%" إلى "باقة توفير (قطعتين + شحن مجاني)" لرفع قيمة السلة (AOV).
3. **فحص الـ Frequency:**
   - لو تكرار الإعلان تخطى 3.0، يبقى نفس الجمهور بيشوف الإعلان ومبيشتريش؛ وسّع الاستهداف (Advantage+ Broad) ونزل كرييتف جديد.
`;
    }

    // ==========================================
    // Intent 2: Market Expansion & Local Nuances (Priority when country is specified)
    // ==========================================
    if (
      msg.includes('سعودية') ||
      msg.includes('السعودية') ||
      msg.includes('الخليج') ||
      msg.includes('مصر') ||
      msg.includes('كويت') ||
      msg.includes('امارات') ||
      msg.includes('سوق')
    ) {
      if (msg.includes('سعودية') || msg.includes('السعودية') || msg.includes('الخليج') || msg.includes('كويت') || msg.includes('امارات')) {
        return `
السوق في **المملكة العربية السعودية والخليج** سوق واعد جداً لكن له قواعد حاسمة لازم تراعيها عشان تنجح وتتوسع بأرباح صافية:

🇸🇦 **قواعد النجاح والتوسع في السعودية ودول الخليج:**
1. **طرق الدفع وبناء الثقة (Payment Gateways):**
   - وفر الدفع عبر **مدى (Mada)** و **Apple Pay** و **تابي/تمارا (Tabby & Tamara)**. الدفع بالتقسيط بيرفع معدل التحويل 40%+!
   - لو هتشتغل دفع عند الاستلام (COD)، توقع نسبة استرجاع 15-20% في السعودية، فلازم تسعر بحيث هامش ربحك يغطي ده.
2. **نوعية المحتوى الإعلاني (UGC is King):**
   - الإعلانات المصورة بكاميرا آيفون عفوية بصوت خليجي محلي (نجدي أو حجازي) بتحقق 3 أضعاف التحويل مقارنة بالفيديوهات المصطنعة.
3. **أفضل المنصات في السعودية:**
   - **Snapchat Ads & TikTok Ads** هما الأقوى للمبيعات المباشرة السريعة، مع **Meta (Instagram)** لمنتجات الموضة والديكور والبراندات الراقية.
`;
      }

      return `
🇪🇬 **قواعد اللعب في السوق المصري (Egyptian Market Playbook):**
1. **عامل السعر والقيمة (Value for Money):**
   - العميل المصري حساس للسعر لكنه بيعشق العروض الملموسة: "عرض الـ 3 قطع" أو "معاينة قبل الاستلام والشحن مجاناً".
2. **سلسلة الواتساب لتأكيد الطلبات (WhatsApp COD Sequence):**
   - 85%+ من المبيعات في مصر دفع عند الاستلام. لازم تبعت رسالة واتساب آلية خلال 60 ثانية من تسجيل الطلب للتأكيد لرفع نسبة الاستلام من 60% لـ 85%+.
3. **المنصة الأساسية في مصر:**
   - **Facebook & Instagram** هما الملك بلا منازع، مع استخدام رسائل الماسنجر والواتساب لإتمام الصفقات الكبيرة.
`;
    }

    // ==========================================
    // Intent 3: Creative, Video Hooks, and Scriptwriting
    // ==========================================
    if (
      msg.includes('كرييتف') ||
      msg.includes('فيديو') ||
      msg.includes('هوك') ||
      msg.includes('hook') ||
      msg.includes('افكار') ||
      msg.includes('أفكار') ||
      msg.includes('اعلان') ||
      msg.includes('إعلان') ||
      msg.includes('سكريبت')
    ) {
      return `
إليك **3 زوايا إعلانية وفيديوهات UGC فيروسية** جاهزة للتصوير فوراً لكسر الملل ومضاعفة المبيعات:

🎬 **الزاوية 1: خطاف الصدمة وكسر التصفح (Pattern Interrupt Hook):**
- **أول 3 ثواني:** المتحدث ينظر للكاميرا مباشرة ويوقف الشاشة بيده:
  > *"وقف سكرول ثانية! لو بتدور على [المنتج] عشان [الميزة].. متشتريش من أي صفحة غير لما تشوف المقارنة دي الأول!"*
- **العرض والـ CTA:** استعراض خامة المنتج الحقيقية مع إظهار كود الخصم في الأسفل.

🎬 **الزاوية 2: خطاف لمس المشكلة والألم (Problem-Agitation Angle):**
- **أول 3 ثواني:** مشهد لمعاناة حقيقية يعيشها العميل يومياً:
  > *"أنا كنت فاكر إن مشكلة [الألم] ملهاش حل، وجربت كل الطرق وخسرت فلوس.. لحد ما جربت الاختراع ده!"*
- **الحل:** استعراض التحول السريع مع المنتج وضمان المعاينة قبل الاستلام.

🎬 **الزاوية 3: خطاف كشف السر والفضول (Curiosity Gap):**
- **أول 3 ثواني:** فتح صندوق المنتج Unboxing بإضاءة نظيفة:
  > *"السر اللي كل التجار مخبينه عن [المنتج].. وليه بقى الأكثر مبيعاً الأسبوع ده؟"*

💡 **نصيحة ذهبية:** صور 3 افتتاحيات (Hooks) مختلفة لنفس الفيديو، واختبرهم في حملة واحدة، وشوف الهوك اللي يخلي الناس تكمل الفيديو للآخر!
`;
    }

    // ==========================================
    // Intent 4: General Campaign Evaluation ("ايه رأيك في الكامبينز", "الوضع تمام", "قيم الأداء")
    // ==========================================
    if (
      msg.includes('رأيك') ||
      msg.includes('الكامبينز') ||
      msg.includes('الحملات') ||
      msg.includes('قيم') ||
      msg.includes('تمام ولا ايه') ||
      msg.includes('الأداء')
    ) {
      let winnersBreakdown = winners.length > 0
        ? winners.map((w) => `• 🏆 **${w.name}**: تحقق ROAS رائع (**${w.roas.toFixed(2)}x**) بـ CPA رابح ($${w.cpa.toFixed(2)}) مع ${w.conversions} مبيعات.`).join('\n')
        : '• لا توجد حملات متفوقة حالياً، الأداء في النطاق المتوسط.';

      let bleedersBreakdown = bleeders.length > 0
        ? bleeders.map((b) => `• ⚠️ **${b.name}**: نزيف أرباح! صرفت $${b.spend.toFixed(2)} والـ CPA مرتفع جداً ($${b.cpa.toFixed(2)}) والـ ROAS (${b.roas.toFixed(2)}x) خاسر.`).join('\n')
        : '• ممتاز! لا توجد حملات خاسرة خارج السيطرة.';

      return `
تحليلي المالي والإعلاني الدقيق للحساب (**${portfolioName}**):

📊 **ملخص الأرقام الحية:**
- إجمالي الصرف: **$${totalSpend.toFixed(2)}** عبر **${activeCount} حملات نشطة**.
- إجمالي المبيعات: **${totalConversions} تحويل** | متوسط الـ ROAS: **${avgRoas}x** | متوسط الـ CPA: **$${avgCpa}**.

🔍 **تفصيل حالة كل حملة:**
${winnersBreakdown}
${bleedersBreakdown}

💡 **القرار الاستراتيجي المطلوب منك الآن:**
1. **${bleeders.length > 0 ? `🛑 أوقف فوراً حملة (${bleeders[0].name}) لأنها بتسحب فلوس بدون عائد مناسب.` : '✅ استمر في مراقبة الحملات الحالية.'}**
2. **${winners.length > 0 ? `🚀 ارفع ميزانية (${winners[0].name}) بنسبة +20% اليوم (Vertical Scaling).` : '🎨 جهز زوايا إعلانية جديدة للاختبار.'}**
3. طبق قاعدة **70/20/10**: 70% من الميزانية للحملات الرابحة، 20% لاختبار فيديوهات جديدة، و 10% لاختبار عروض قوية.
`;
    }

    // ==========================================
    // Intent 5: Scaling & Growth ("ازاي أكبر", "أزود الميزانية", "Scale", "أضاعف المبيعات")
    // ==========================================
    if (
      msg.includes('أكبر') ||
      msg.includes('ازاي ازود') ||
      msg.includes('توسيع') ||
      msg.includes('scale') ||
      msg.includes('اضاعف') ||
      msg.includes('ميزانية') ||
      msg.includes('تكبير')
    ) {
      const topWinner = winners[0] || campaigns[0];
      const currentBudget = topWinner?.dailyBudget || 100;
      const scaledBudget = Math.round(currentBudget * 1.2);

      return `
عشان تضاعف مبيعاتك وتعمل **Scaling صح بدون ما تخرّب الخوارزمية**، اتبع القواعد دي:

🚀 **1. التوسيع الرأسي التدريجي (Vertical Scaling - 20% Rule):**
- ميزانية حملة **"${topWinner?.name || 'الحملة الفائزة'}"** حالياً $${currentBudget}/يوم.
- ارفع الميزانية إلى **$${scaledBudget}/يوم** (+20%) وثبتها لمدة 48 ساعة.
- *ليه؟* لو رفعت الميزانية 50% أو 100% مرة واحدة، الـ Meta Algorithm هترجع لـ Learning Phase والـ CPA هيطير في السما!

🌐 **2. التوسيع الأفقي (Horizontal Scaling & Creative Duplication):**
- اعمل Duplicate لأفضل Ad Set رابحة.
- سيب الأولى شغالة زي ما هي، والتانية خليها **Advantage+ Broad** بالكامل بدون أي اهتمامات مع إضافة 3 أشكال كرييتف جديدة (فيديو قصير + كاروسيل + صورة بتصميم بسيط).

📦 **3. رفع قيمة متوسط السلة (AOV - Average Order Value):**
- متكتفيش ببيع قطعة واحدة: ضيف خيار "اشترِ 2 واحصل على الثالثة بخصم 50% وشحن مجاني".
- الحركة دي بتضاعف عائد الـ ROAS بنفس تكلفة الإعلان!
`;
    }

    // ==========================================
    // Intent 6: High CPA & Cost Optimization ("CPA عالي", "التكلفة غالية", "خفض التكلفة")
    // ==========================================
    if (
      msg.includes('cpa') ||
      msg.includes('تكلفة') ||
      msg.includes('غالي') ||
      msg.includes('مرتفع') ||
      msg.includes('عالي') ||
      msg.includes('تخفيض')
    ) {
      return `
ارتفاع الـ CPA (تكلفة الشراء) له **3 أسباب رئيسية فقط** في عالم الميديا باينج:

1. **سبب إعلاني (Hook & CTR Issue):**
   - لو نسبة النقر CTR أقل من 1.5%، معناها إن الإعلان مش جذاب كفاية والـ Meta بتحاسبك أغلى على الظهور.
   - **الحل:** غير أول 3 ثواني من الفيديو وضع نص كبير بلون أصفر أو أبيض يكسر التصفح.
2. **سبب في العرض (Offer Friction):**
   - لو الناس بتدخل الصفحة ومبتشتريش، العرض مش مغري كفاية.
   - **الحل:** جرب عرض "اشترِ 1 واحصل على التاني بخصم 40%" أو "ضمان استرجاع مجاني 14 يوم".
3. **سبب في صفحة الشراء (Checkout Friction):**
   - صفحة بطيئة، أو نموذج طلب بيطلب بيانات كتيرة (اسم المحافظة، الإيميل، الرمز البريدي).
   - **الحل:** خلي نموذج الطلب من 3 خانات فقط: (الاسم، الموبايل، العنوان بالتفصيل).
`;
    }

    // ==========================================
    // Fallback: Multi-angle Senior Strategic Advice
    // ==========================================
    return `
تحليلي المالي والتسويقي الشامل لحسابك الإعلاني:

1. **حالة الحملات الحالية:**
   - إجمالي الصرف: **$${totalSpend.toFixed(2)}** | متوسط الـ ROAS: **${avgRoas}x** | متوسط الـ CPA: **$${avgCpa}**.
   - ${winners.length > 0 ? `لديك حملات رابحة مثل **${winners[0].name}** تستحق زيادة الميزانية بنسبة 20%.` : 'الحساب يحتاج إلى اختبار زوايا إعلانية جديدة لرفع معدلات التحويل.'}
   - ${bleeders.length > 0 ? `⚠️ يجب إيقاف حملة **${bleeders[0].name}** فوراً لمنع نزيف الأرباح.` : '✅ الأداء تحت السيطرة ولا توجد حملات خاسرة خارج الحدود.'}

2. **التوصية التكتيكية للأيام القادمة:**
   - ركز على قاعدة **70/20/10**: 70% من الصرف على الحملات الفائزة، 20% لاختبار فيديوهات UGC جديدة، و 10% لاختبار عروض وباقات جديدة.
   - وسّع الاستهداف باستخدام **Advantage+ Broad** ودع الإعلان نفسه يقوم بالفلترة والاستهداف الذكي.

لو حابب نتناقش في زاوية معينة (مثل: إعلانات منتج محدد، استراتيجية التوسع في السعودية، أو كتابة سكريبت فيديو جديد)، اسألني فوراً!
`;
  }
}
