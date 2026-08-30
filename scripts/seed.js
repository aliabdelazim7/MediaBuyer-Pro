const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Media Buyer CRM database with realistic data...');

  // 1. Create Ad Account
  const account = await prisma.adAccount.upsert({
    where: { accountId: 'act_1234567890' },
    update: {},
    create: {
      accountId: 'act_1234567890',
      name: 'Main E-Commerce Egypt & Gulf Account',
      platform: 'META',
      currency: 'USD',
      status: 'ACTIVE',
    },
  });

  // 2. Create Campaigns
  const campaignsData = [
    {
      platformId: 'camp_101',
      name: '🔥 Mega Flash Sale - Conversions (Egypt)',
      objective: 'OUTCOME_SALES',
      status: 'ACTIVE',
      dailyBudget: 120.0,
      spend: 115.4,
      impressions: 48500,
      clicks: 1420,
      conversions: 18,
      conversionValue: 460.0,
      cpc: 0.08,
      cpm: 2.38,
      ctr: 2.93,
      cpa: 6.41,
      roas: 3.99,
    },
    {
      platformId: 'camp_102',
      name: '⚠️ High CPA Warning - Retargeting DPA',
      objective: 'OUTCOME_SALES',
      status: 'ACTIVE',
      dailyBudget: 75.0,
      spend: 72.8,
      impressions: 18200,
      clicks: 310,
      conversions: 2,
      conversionValue: 54.0,
      cpc: 0.23,
      cpm: 4.0,
      ctr: 1.7,
      cpa: 36.4,
      roas: 0.74,
    },
    {
      platformId: 'camp_103',
      name: '🚀 Winning Creative - Broad Advantage+ (Gulf)',
      objective: 'OUTCOME_SALES',
      status: 'ACTIVE',
      dailyBudget: 200.0,
      spend: 198.5,
      impressions: 92400,
      clicks: 3850,
      conversions: 45,
      conversionValue: 980.0,
      cpc: 0.05,
      cpm: 2.15,
      ctr: 4.17,
      cpa: 4.41,
      roas: 4.94,
    },
    {
      platformId: 'camp_104',
      name: '⏸️ Paused Lead Gen - Real Estate B2B',
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      dailyBudget: 50.0,
      spend: 34.2,
      impressions: 9800,
      clicks: 140,
      conversions: 6,
      conversionValue: 0.0,
      cpc: 0.24,
      cpm: 3.49,
      ctr: 1.43,
      cpa: 5.7,
      roas: 0.0,
    },
  ];

  for (const c of campaignsData) {
    await prisma.campaign.upsert({
      where: { platformId: c.platformId },
      update: c,
      create: {
        ...c,
        adAccountId: account.id,
      },
    });
  }

  // 3. Create Automation Rules
  const rulesData = [
    {
      name: '🚨 High CPA Kill Switch (> $25)',
      description: 'يقوم بإيقاف الحملة فوراً إذا تجاوزت تكلفة التحويل 25 دولار بعد صرف 30 دولار على الأقل.',
      metric: 'CPA',
      operator: 'GREATER_THAN',
      threshold: 25.0,
      minSpendCondition: 30.0,
      action: 'PAUSE',
      notifyTelegram: true,
      isEnabled: true,
    },
    {
      name: '🚀 Winning Campaign Scale (+20% Budget)',
      description: 'يقوم برفع ميزانية الحملة اليومية بنسبة 20% عندما يتخطى الـ ROAS حاجز 3.5x.',
      metric: 'ROAS',
      operator: 'GREATER_THAN_OR_EQUAL',
      threshold: 3.5,
      minSpendCondition: 50.0,
      action: 'BOOST_BUDGET',
      actionParam: 20.0,
      notifyTelegram: true,
      isEnabled: true,
    },
    {
      name: '⚠️ Low CTR Fatigue Alert (< 1.0%)',
      description: 'يرسل تنبيه تليجرام عند هبوط نسبة النقر CTR لأقل من 1% لتغيير الكرييتف.',
      metric: 'CTR',
      operator: 'LESS_THAN',
      threshold: 1.0,
      minSpendCondition: 20.0,
      action: 'SEND_ALERT',
      notifyTelegram: true,
      isEnabled: true,
    },
  ];

  for (const r of rulesData) {
    const existing = await prisma.automationRule.findFirst({ where: { name: r.name } });
    if (!existing) {
      await prisma.automationRule.create({ data: r });
    }
  }

  // 4. Create Social Page & Comments
  const page = await prisma.socialPage.upsert({
    where: { pageId: 'page_main_fb' },
    update: {},
    create: {
      pageId: 'page_main_fb',
      name: 'Fashion & Tech Store (Official)',
      platform: 'FACEBOOK',
      isActive: true,
    },
  });

  const commentsData = [
    {
      commentId: 'comm_001',
      senderName: 'كريم الشناوي',
      senderId: 'user_karim',
      postId: 'post_101',
      message: 'بكام التيشيرت ده لو سمحت وفيه مقاس 2XL والشحن للإسكندرية بكام؟',
      sentiment: 'INQUIRY_PRICE',
      intent: 'PRICE_INQUIRY',
      status: 'PENDING',
      replyMessage: 'أهلاً بك يا كريم! 🌟 بعتنالك كل المقاسات والأسعار في رسالة خاصة (DM) مع كود خصم خاص بالشحن، شيك على رسايلك! 🚀',
    },
    {
      commentId: 'comm_002',
      senderName: 'منى عبد الله',
      senderId: 'user_mona',
      postId: 'post_101',
      message: 'الخامة بجد تحفة جداً والتوصيل جالي تاني يوم شكراً ليكم ❤️',
      sentiment: 'POSITIVE',
      intent: 'PRAISE',
      status: 'REPLIED',
      replyMessage: 'حبيبتي يا منى تسلمي وذوقك عالي جداً! ❤️ سعداء جداً بتجربتك ودايماً منورانا!',
      repliedAt: new Date(),
    },
    {
      commentId: 'comm_003',
      senderName: 'ياسر ممدوح',
      senderId: 'user_yasser',
      postId: 'post_102',
      message: 'الأوردر اتأخر 4 أيام ومحدش بيرد على التليفون خدمة سيئة',
      sentiment: 'NEGATIVE',
      intent: 'COMPLAINT',
      status: 'PENDING',
      replyMessage: 'نعتذر لحضرتك جداً يا أستاذ ياسر على أي إزعاج! 🙏 يرجى التواصل معانا في الخاص برقم تليفونك وفريق المتابعة هيتواصل معاك فوراً لحل المشكلة وتعويضك.',
    },
    {
      commentId: 'comm_004',
      senderName: 'فرصة عمل أونلاين',
      senderId: 'user_spammer',
      postId: 'post_103',
      message: 'اربح معنا 500 دولار يومياً من المنزل اضغط على الرابط التالي www.scamlink.com',
      sentiment: 'SPAM',
      intent: 'SPAM',
      status: 'HIDDEN',
      replyMessage: '',
    },
  ];

  for (const c of commentsData) {
    await prisma.comment.upsert({
      where: { commentId: c.commentId },
      update: c,
      create: {
        ...c,
        pageId: page.id,
      },
    });
  }

  // 5. Create CRM Leads
  const leadsData = [
    {
      name: 'كريم الشناوي',
      phone: '01012345678',
      email: 'karim@example.com',
      source: 'FACEBOOK_COMMENT',
      stage: 'NEW',
      dealValue: 450,
      currency: 'EGP',
      notes: 'سأل عن مقاس 2XL والشحن للإسكندرية',
    },
    {
      name: 'سارة إبراهيم',
      phone: '01198765432',
      email: 'sara@example.com',
      source: 'INSTAGRAM_DM',
      stage: 'QUALIFIED',
      dealValue: 850,
      currency: 'EGP',
      notes: 'ترغب في طلب قطعتين عرض خاص',
    },
    {
      name: 'محمود عبد الفتاح',
      phone: '01234567890',
      source: 'LEAD_FORM',
      stage: 'WON',
      dealValue: 1200,
      currency: 'EGP',
      notes: 'تم تأكيد وشحن الطلب بنجاح',
    },
  ];

  for (const l of leadsData) {
    const existing = await prisma.lead.findFirst({ where: { name: l.name } });
    if (!existing) {
      await prisma.lead.create({ data: l });
    }
  }

  console.log('✅ Database seeded successfully with campaigns, auto-pilot rules, comments & leads!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
