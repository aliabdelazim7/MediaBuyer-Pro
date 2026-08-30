import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';
import { ToggleCampaignUseCase } from '@/application/use-cases/ToggleCampaignUseCase';
import { MetaGraphClient } from '@/infrastructure/meta/MetaGraphClient';
import { MockMetaGraphClient } from '@/infrastructure/meta/MockMetaGraphClient';
import { TelegramBotClient } from '@/infrastructure/telegram/TelegramBotClient';

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const telegram = new TelegramBotClient();

    // 1. Handle Callback Queries (when user presses an Inline Button)
    if (update.callback_query) {
      const callback = update.callback_query;
      const data = callback.data as string; // Format: "actionKey:payload"
      const [actionKey, payload] = data.split(':');
      const chatId = callback.message?.chat?.id;

      const metaClient =
        process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN !== 'your_system_user_or_page_access_token'
          ? new MetaGraphClient()
          : new MockMetaGraphClient();

      if (actionKey === 'toggle_camp') {
        const toggle = new ToggleCampaignUseCase();
        const res = await toggle.execute(payload);
        await telegram.sendMessage(
          `✅ <b>تم تحديث حالة الحملة:</b>\n${res.name}\nالحالة الجديدة: <b>${res.status}</b>`,
          { chatId: String(chatId) }
        );
      } else if (actionKey === 'reply_comment') {
        const comment = await prisma.comment.findUnique({ where: { id: payload } });
        if (comment && comment.replyMessage) {
          await metaClient.replyToComment(comment.commentId, comment.replyMessage);
          await prisma.comment.update({
            where: { id: payload },
            data: { status: 'REPLIED', repliedAt: new Date() },
          });
          await telegram.sendMessage(
            `✅ <b>تم إرسال الرد للعميل ${comment.senderName}:</b>\n"${comment.replyMessage}"`,
            { chatId: String(chatId) }
          );
        }
      } else if (actionKey === 'hide_comment') {
        const comment = await prisma.comment.findUnique({ where: { id: payload } });
        if (comment) {
          await metaClient.hideComment(comment.commentId);
          await prisma.comment.update({
            where: { id: payload },
            data: { status: 'HIDDEN' },
          });
          await telegram.sendMessage(
            `👁️ <b>تم إخفاء التعليق بنجاح</b> للعميل ${comment.senderName}`,
            { chatId: String(chatId) }
          );
        }
      }
    }

    // 2. Handle Direct Bot Commands (e.g. /status, /pause_all, /rules)
    if (update.message?.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;

      if (text === '/status' || text === 'أداء الحملات') {
        const campaigns = await prisma.campaign.findMany();
        const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
        const totalPurchases = campaigns.reduce((acc, c) => acc + c.conversions, 0);
        const totalRevenue = campaigns.reduce((acc, c) => acc + c.conversionValue, 0);
        const avgRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0';

        let summary = `📊 <b>تقرير الأداء اللحظي:</b>\n\n`;
        summary += `💰 <b>إجمالي الصرف:</b> $${totalSpend.toFixed(2)}\n`;
        summary += `🎯 <b>المبيعات/التحويلات:</b> ${totalPurchases}\n`;
        summary += `📈 <b>متوسط الـ ROAS:</b> ${avgRoas}x\n\n`;
        summary += `<b>الحملات الحالية:</b>\n`;

        for (const c of campaigns) {
          const statusIcon = c.status === 'ACTIVE' ? '🟢' : '⏸️';
          summary += `${statusIcon} <b>${c.name}</b>\n   الصرف: $${c.spend.toFixed(2)} | CPA: $${c.cpa.toFixed(2)} | ROAS: ${c.roas}x\n`;
        }

        await telegram.sendMessage(summary, { chatId: String(chatId) });
      } else if (text === '/start') {
        await telegram.sendMessage(
          `👋 أهلاً بك في <b>Media Buyer Auto-Pilot Command Center</b>!\n\nيمكنك استخدام الأوامر التالية:\n/status - عرض ملخص الأداء اللحظي\n/rules - فحص القواعد الذكية\n/help - المساعدة`,
          { chatId: String(chatId) }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
