import { NextResponse } from 'next/server';
import { ProcessCommentUseCase } from '@/application/use-cases/ProcessCommentUseCase';

// Verification handshake for Meta Webhook
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'crm_secret_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Verification token mismatch', { status: 403 });
}

// Event receiver for Meta Webhook (Facebook / Instagram Feed & Messages)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object === 'page') {
      const processor = new ProcessCommentUseCase();

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'feed' && change.value?.item === 'comment' && change.value?.verb === 'add') {
            const val = change.value;
            await processor.execute({
              pageId: entry.id,
              postId: val.post_id,
              commentId: val.comment_id,
              senderName: val.from?.name || 'متابع الصفحة',
              senderId: val.from?.id || 'unknown_user',
              message: val.message || '',
              autoReplyEnabled: true, // Configurable in settings
            });
          }
        }
      }

      return NextResponse.json({ success: true, status: 'EVENT_RECEIVED' });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Meta Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
