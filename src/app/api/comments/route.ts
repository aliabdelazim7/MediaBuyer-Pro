import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';
import { ProcessCommentUseCase } from '@/application/use-cases/ProcessCommentUseCase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sentiment = searchParams.get('sentiment');
    const status = searchParams.get('status');

    let comments = await prisma.comment.findMany({
      where: {
        ...(sentiment ? { sentiment: sentiment as any } : {}),
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        page: true,
      },
    });

    // Auto-seed sample comments if empty
    if (comments.length === 0) {
      const processor = new ProcessCommentUseCase();

      await processor.execute({
        pageId: 'page_main_fb',
        postId: 'post_101',
        commentId: 'comment_sample_1',
        senderName: 'كريم الشناوي',
        senderId: 'user_karim',
        message: 'بكام التيشيرت ده وفيه شحن للإسكندرية؟',
        autoReplyEnabled: false,
      });

      await processor.execute({
        pageId: 'page_main_fb',
        postId: 'post_101',
        commentId: 'comment_sample_2',
        senderName: 'منى عبد الله',
        senderId: 'user_mona',
        message: 'الخامة بجد تحفة جداً والتوصيل جالي تاني يوم شكراً ليكم ❤️',
        autoReplyEnabled: false,
      });

      await processor.execute({
        pageId: 'page_main_fb',
        postId: 'post_102',
        commentId: 'comment_sample_3',
        senderName: 'ياسر ممدوح',
        senderId: 'user_yasser',
        message: 'الأوردر اتأخر 4 أيام ومحدش بيرد على التليفون خدمة سيئة',
        autoReplyEnabled: false,
      });

      comments = await prisma.comment.findMany({
        orderBy: { createdAt: 'desc' },
        include: { page: true },
      });
    }

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      pageId = 'page_main_fb',
      postId = `post_${Date.now()}`,
      commentId = `comment_${Date.now()}`,
      senderName,
      senderId = `user_${Date.now()}`,
      message,
      autoReplyEnabled = false,
    } = body;

    if (!senderName || !message) {
      return NextResponse.json({ success: false, error: 'Sender name and message are required' }, { status: 400 });
    }

    const processor = new ProcessCommentUseCase();
    const result = await processor.execute({
      pageId,
      postId,
      commentId,
      senderName,
      senderId,
      message,
      autoReplyEnabled,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
