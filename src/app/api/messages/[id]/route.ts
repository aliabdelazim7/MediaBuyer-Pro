import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    // Mark as read
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const body = await req.json();
    const { text, senderType = 'AGENT' } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Message text is required' }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        conversationId,
        senderType,
        text,
        isRead: true,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: text,
        lastMessageAt: new Date(),
        unreadCount: 0,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const body = await req.json();
    const { status, sentiment } = body;

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(status ? { status } : {}),
        ...(sentiment ? { sentiment } : {}),
      },
    });

    return NextResponse.json({ success: true, conversation: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
