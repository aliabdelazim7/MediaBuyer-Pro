import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    const lastCustomerMsg = conversation.messages.find((m) => m.senderType === 'CUSTOMER')?.text || conversation.lastMessageText;
    const senderName = conversation.senderName.split(' ')[0] || 'يا فندم';
    const portfolio = conversation.portfolioName || '';

    let aiDraft = '';

    // Specialized conversion-focused prompts by portfolio dialect & industry
    if (portfolio.includes('عاصمة الكون') || conversation.platform === 'WHATSAPP') {
      aiDraft = `أهلاً بك يا ${senderName}، شرفتنا ونورنا يا غالي! 🌟 يسعدنا خدمتك في مؤسسة عاصمة الكون للمصاعد. بخصوص استفسارك عن المصعد، نوفر أحدث الموديلات الإيطالية والهيدروليك بضمان شامل وصيانة دورية. ممكن تتفضل بتحديد المدينة ورقم جوالك لنرسل لك عرض السعر الفني والمواصفات فوراً؟ 🚀`;
    } else if (portfolio.includes('الهبا')) {
      aiDraft = `أهلاً بك يا ${senderName}! 🌟 نورت شركة الهبا للبالة الخليجي. بضاعة السوبر كريم عندنا درجة أولى مختومة ومفروزة على الفرازة، والشكاير بتبدأ من 25 و 45 كيلو لأعلى جودة بأفضل سعر جملة في مصر. تحب أبعتلك قايمة الأسعار وكتالوج الشغل على الواتساب فوراً برقم تليفونك؟ 📦🔥`;
    } else if (portfolio.includes('حنيجل')) {
      aiDraft = `مساء الخير يا ${senderName}، نورت شركة حنيجل للكاميرات وأنظمة المراقبة! 📷 السيستم متاح حالياً بالضمان المعتمد وبأعلى دقة 5MP رؤية ليلية ملونة، وعليه كود خصم خاص بمناسبة العرض. ابعتلنا رقم تليفونك واللوكيشن ومهندس التركيبات هيتواصل معاك فوراً لتحديد موعد المعاينة ⚡`;
    } else if (portfolio.includes('حسن الحوت')) {
      aiDraft = `أهلاً بك يا ${senderName} في مصنع ومؤسسة حسن الحوت للآلات والمعدات الزراعية! 🌾 المعدات متوفرة بقطع غيارها الأصلية وضمان الصيانة الفورية. ممكن رقمك وفريق المبيعات الفنية هيكلمك يوضحلك كل التفاصيل والأسعار بالتقسيط أو الكاش.`;
    } else {
      aiDraft = `أهلاً بك يا ${senderName}! 🌟 شكراً لتواصلك معانا. طلبك متاح وفي خدمتك دايماً، ممكن رقم تليفونك ومندوب المبيعات هيتواصل معاك فوراً بجميع التفاصيل وكود الخصم! 🚀`;
    }

    return NextResponse.json({ success: true, aiDraft });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
