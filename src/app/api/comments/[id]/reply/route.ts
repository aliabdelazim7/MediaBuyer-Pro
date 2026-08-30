import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';
import { MetaGraphClient } from '@/infrastructure/meta/MetaGraphClient';
import { MockMetaGraphClient } from '@/infrastructure/meta/MockMetaGraphClient';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const body = await req.json();
    const { action = 'REPLY', message } = body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    }

    const metaClient =
      process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN !== 'your_system_user_or_page_access_token'
        ? new MetaGraphClient()
        : new MockMetaGraphClient();

    if (action === 'REPLY') {
      const replyText = message || comment.replyMessage || 'تم الرد في الخاص يا فندم';
      await metaClient.replyToComment(comment.commentId, replyText);

      const updated = await prisma.comment.update({
        where: { id: commentId },
        data: {
          status: 'REPLIED',
          replyMessage: replyText,
          repliedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, comment: updated });
    } else if (action === 'SEND_DM') {
      const dmText = message || comment.replyMessage || 'أهلاً بك يا فندم، بعتنالك تفاصيل العرض';
      await metaClient.sendPrivateReply(comment.commentId, dmText);

      const updated = await prisma.comment.update({
        where: { id: commentId },
        data: {
          isPrivateReplied: true,
          status: 'REPLIED',
          repliedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, comment: updated });
    } else if (action === 'HIDE') {
      await metaClient.hideComment(comment.commentId);

      const updated = await prisma.comment.update({
        where: { id: commentId },
        data: { status: 'HIDDEN' },
      });

      return NextResponse.json({ success: true, comment: updated });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
