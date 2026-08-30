import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const portfolio = searchParams.get('portfolio');
    const status = searchParams.get('status');

    let whereClause: any = {};
    if (platform && platform !== 'ALL') whereClause.platform = platform;
    if (portfolio && portfolio !== 'ALL') whereClause.portfolioName = portfolio;
    if (status && status !== 'ALL') whereClause.status = status;

    let conversations = await prisma.conversation.findMany({
      where: whereClause,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Seed initial realistic conversations across real portfolios if empty
    if (conversations.length === 0 && !platform && !portfolio && !status) {
      const seeded = [
        {
          platform: 'MESSENGER',
          platformThreadId: 'thread_heba_01',
          senderName: 'محمد طارق الإسكندراني',
          senderId: 'fb_user_101',
          pageName: 'شركة الهبا للبالة الخليجى',
          portfolioName: 'شركة الهبا للبالة الخليجى',
          status: 'OPEN',
          unreadCount: 1,
          sentiment: 'INQUIRY_PRICE' as const,
          lastMessageText: 'السلام عليكم، عايز أعرف تفاصيل بالات الملابس السوبر كريم الكريمة وأسعار الشكارة كام كيلو؟',
          messages: {
            create: [
              { senderType: 'CUSTOMER', text: 'مساء الخير يا فندم، شوفت إعلانكم على الفيسبوك', isRead: true },
              { senderType: 'AGENT', text: 'أهلاً بك يا أستاذ محمد! منور شركة الهبا للبالة الخليجي 🌟', isRead: true },
              { senderType: 'CUSTOMER', text: 'السلام عليكم، عايز أعرف تفاصيل بالات الملابس السوبر كريم الكريمة وأسعار الشكارة كام كيلو؟', isRead: false },
            ],
          },
        },
        {
          platform: 'WHATSAPP',
          platformThreadId: 'thread_asema_02',
          senderName: 'المهندس عبد العزيز الراجحي',
          senderId: 'wa_user_202',
          pageName: 'عاصمة الكون للمصاعد',
          portfolioName: 'مؤسسة عاصمة الكون للمصاعد2',
          status: 'OPEN',
          unreadCount: 2,
          sentiment: 'INQUIRY_PRICE' as const,
          lastMessageText: 'كم تكلفة تركيب مصعد بانوراما هيدروليك لفيلا 3 أدوار بالرياض؟',
          messages: {
            create: [
              { senderType: 'CUSTOMER', text: 'السلام عليكم ورحمة الله وبركاته', isRead: true },
              { senderType: 'CUSTOMER', text: 'كم تكلفة تركيب مصعد بانوراما هيدروليك لفيلا 3 أدوار بالرياض؟', isRead: false },
            ],
          },
        },
        {
          platform: 'INSTAGRAM_DM',
          platformThreadId: 'thread_haneegel_03',
          senderName: 'كريم عبد الشافي',
          senderId: 'ig_user_303',
          pageName: 'شركة حنيجل للكاميرات',
          portfolioName: 'حنيجل للكاميرات',
          status: 'OPEN',
          unreadCount: 1,
          sentiment: 'INQUIRY_PRICE' as const,
          lastMessageText: 'متاح سيستم كاميرات هيكفيجن 4 كاميرات 5 ميجا بالـ DVR والهارد؟',
          messages: {
            create: [
              { senderType: 'CUSTOMER', text: 'متاح سيستم كاميرات هيكفيجن 4 كاميرات 5 ميجا بالـ DVR والهارد؟', isRead: false },
            ],
          },
        },
        {
          platform: 'MESSENGER',
          platformThreadId: 'thread_hout_04',
          senderName: 'الحاج إبراهيم منصور',
          senderId: 'fb_user_404',
          pageName: 'حسن الحوت',
          portfolioName: 'حسن الحوت للآلات الزراعية والمعدات',
          status: 'OPEN',
          unreadCount: 0,
          sentiment: 'POSITIVE' as const,
          lastMessageText: 'شكراً يا هندسة، الموتور وصل وشغال تمام الله يباركلكم',
          messages: {
            create: [
              { senderType: 'CUSTOMER', text: 'شكراً يا هندسة، الموتور وصل وشغال تمام الله يباركلكم', isRead: true },
              { senderType: 'AGENT', text: 'تحت أمرك دايماً يا حاج إبراهيم وفي خدمتك في أي وقت! 🙏🌟', isRead: true },
            ],
          },
        },
      ];

      for (const item of seeded) {
        await prisma.conversation.create({ data: item });
      }

      conversations = await prisma.conversation.findMany({
        orderBy: { lastMessageAt: 'desc' },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    return NextResponse.json({ success: true, conversations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platformThreadId, senderName, senderId, pageName, portfolioName, message, platform = 'MESSENGER' } = body;

    const conversation = await prisma.conversation.upsert({
      where: { platformThreadId },
      update: {
        lastMessageText: message,
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
      },
      create: {
        platform,
        platformThreadId,
        senderName,
        senderId,
        pageName,
        portfolioName,
        lastMessageText: message,
      },
    });

    const chatMsg = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: 'CUSTOMER',
        text: message,
      },
    });

    return NextResponse.json({ success: true, conversation, message: chatMsg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
