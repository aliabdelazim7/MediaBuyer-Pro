import { NextResponse } from 'next/server';
import { ToggleCampaignUseCase } from '@/application/use-cases/ToggleCampaignUseCase';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const toggleUseCase = new ToggleCampaignUseCase();
    const result = await toggleUseCase.execute(campaignId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
