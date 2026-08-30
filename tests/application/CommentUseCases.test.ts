import { describe, it, expect, beforeEach } from 'vitest';
import { ProcessCommentUseCase } from '../../src/application/use-cases/ProcessCommentUseCase';
import { MockMetaGraphClient } from '../../src/infrastructure/meta/MockMetaGraphClient';
import { prisma } from '../../src/infrastructure/db/prisma';

describe('Integration: ProcessCommentUseCase Moderation and Lead Capture', () => {
  const mockMeta = new MockMetaGraphClient();

  beforeEach(async () => {
    await prisma.lead.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.socialPage.deleteMany();
  });

  it('should process price inquiry comment, classify sentiment, create lead, and generate smart reply', async () => {
    const useCase = new ProcessCommentUseCase(mockMeta);

    const result = await useCase.execute({
      pageId: 'page_meta_456',
      postId: 'post_ad_789',
      commentId: 'comment_999',
      senderName: 'أحمد محمود',
      senderId: 'user_111',
      message: 'بكام التيشيرت ده وفيه منه مقاس 2XL؟',
      autoReplyEnabled: true,
    });

    expect(result.analysis.sentiment).toBe('INQUIRY_PRICE');
    expect(result.comment.status).toBe('REPLIED');
    expect(result.comment.replyMessage).toContain('أحمد');

    // Verify lead was auto-captured
    const capturedLead = await prisma.lead.findFirst({
      where: { name: 'أحمد محمود' },
    });
    expect(capturedLead).toBeDefined();
    expect(capturedLead?.stage).toBe('NEW');
  });

  it('should flag negative comment, set appropriate intent, and alert without auto-replying rashly', async () => {
    const useCase = new ProcessCommentUseCase(mockMeta);

    const result = await useCase.execute({
      pageId: 'page_meta_456',
      postId: 'post_ad_789',
      commentId: 'comment_1000',
      senderName: 'محمد سامي',
      senderId: 'user_222',
      message: 'الخامة سيئة جداً والتوصيل اتأخر 5 أيام',
      autoReplyEnabled: false,
    });

    expect(result.analysis.sentiment).toBe('NEGATIVE');
    expect(result.comment.status).toBe('PENDING');
    expect(result.analysis.suggestedAction).toBe('ESCALATE');
  });
});
