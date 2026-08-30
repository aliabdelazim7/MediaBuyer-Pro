import { NextResponse } from 'next/server';
import { SyncPageConversationsUseCase } from '@/application/use-cases/SyncPageConversationsUseCase';

export async function POST(_req: Request) {
  try {
    const syncUseCase = new SyncPageConversationsUseCase();
    const result = await syncUseCase.execute();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
