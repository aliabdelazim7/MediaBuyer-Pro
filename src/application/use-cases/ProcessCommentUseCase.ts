import { prisma } from '../../infrastructure/db/prisma';
import { AIService } from '../../infrastructure/ai/AIService';
import { IMetaGraphClient } from '../ports/IMetaGraphClient';
import { ITelegramClient } from '../ports/ITelegramClient';
import { MockMetaGraphClient } from '../../infrastructure/meta/MockMetaGraphClient';
import { MetaGraphClient } from '../../infrastructure/meta/MetaGraphClient';
import { TelegramBotClient } from '../../infrastructure/telegram/TelegramBotClient';

export interface IncomingCommentDTO {
  pageId: string;
  postId: string;
  commentId: string;
  senderName: string;
  senderId: string;
  message: string;
  autoReplyEnabled?: boolean;
}

export class ProcessCommentUseCase {
  private aiService: AIService;
  private metaClient: IMetaGraphClient;
  private telegramClient: ITelegramClient;

  constructor(
    metaClient?: IMetaGraphClient,
    telegramClient?: ITelegramClient,
    aiService?: AIService
  ) {
    this.aiService = aiService || new AIService();
    this.metaClient = metaClient || (
      process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN !== 'your_system_user_or_page_access_token'
        ? new MetaGraphClient()
        : new MockMetaGraphClient()
    );
    this.telegramClient = telegramClient || new TelegramBotClient();
  }

  public async execute(dto: IncomingCommentDTO) {
    // 1. Ensure Page exists
    let page = await prisma.socialPage.findUnique({
      where: { pageId: dto.pageId },
    });

    if (!page) {
      page = await prisma.socialPage.create({
        data: {
          pageId: dto.pageId,
          name: 'Main Brand Page (FB & IG)',
          platform: 'FACEBOOK',
          isActive: true,
        },
      });
    }

    // 2. Classify comment sentiment & generate smart response
    const deepAnalysis = await this.aiService.analyzeCommentDeep(dto.message);
    // Personalize reply with sender name
    if (dto.senderName) {
      deepAnalysis.replyDraft = await this.aiService.generateSmartReply({
        senderName: dto.senderName,
        commentMessage: dto.message,
      });
    }

    // 3. Upsert comment in DB
    const savedComment = await prisma.comment.upsert({
      where: { commentId: dto.commentId },
      update: {
        message: dto.message,
        sentiment: deepAnalysis.sentiment as any,
        intent: deepAnalysis.suggestedAction,
        replyMessage: deepAnalysis.replyDraft,
      },
      create: {
        pageId: page.id,
        postId: dto.postId,
        commentId: dto.commentId,
        senderName: dto.senderName,
        senderId: dto.senderId,
        message: dto.message,
        sentiment: deepAnalysis.sentiment as any,
        intent: deepAnalysis.suggestedAction,
        status: 'PENDING',
        replyMessage: deepAnalysis.replyDraft,
      },
    });

    // 4. Auto-convert Price Inquiry to CRM Lead
    if (deepAnalysis.sentiment === 'INQUIRY_PRICE') {
      const existingLead = await prisma.lead.findFirst({
        where: { name: dto.senderName },
      });

      if (!existingLead) {
        await prisma.lead.create({
          data: {
            name: dto.senderName,
            source: 'FACEBOOK_COMMENT',
            stage: 'NEW',
            dealValue: 150,
            currency: 'EGP',
            notes: `Auto-captured lead from comment: "${dto.message}"`,
          },
        });
      }
    }

    // 5. Send Telegram Alert for Negative Comment or Urgent Inquiry
    if (deepAnalysis.sentiment === 'NEGATIVE' || deepAnalysis.sentiment === 'INQUIRY_PRICE') {
      const emoji = deepAnalysis.sentiment === 'NEGATIVE' ? '⚠️ شكوى أو تعليق سلبي' : '🔥 عميل يسأل عن السعر';
      await this.telegramClient.sendAlertWithActions(
        `${emoji} على صفحة ${page.name}`,
        `<b>العميل:</b> ${dto.senderName}\n` +
        `<b>التعليق:</b> "${dto.message}"\n\n` +
        `<b>الرد الذكي المقترح:</b>\n<i>"${deepAnalysis.replyDraft}"</i>`,
        [
          { label: '✅ إرسال الرد المقترح', actionKey: 'reply_comment', payload: savedComment.id },
          { label: '👁️ إخفاء الكومنت', actionKey: 'hide_comment', payload: savedComment.id },
        ]
      );
    }

    // 6. If auto-reply is requested and text is available, post reply
    let finalComment = savedComment;
    if (dto.autoReplyEnabled && deepAnalysis.replyDraft && deepAnalysis.sentiment !== 'SPAM') {
      await this.metaClient.replyToComment(dto.commentId, deepAnalysis.replyDraft);
      finalComment = await prisma.comment.update({
        where: { id: savedComment.id },
        data: {
          status: 'REPLIED',
          repliedAt: new Date(),
        },
      });
    }

    return {
      comment: finalComment,
      analysis: deepAnalysis,
    };
  }
}
