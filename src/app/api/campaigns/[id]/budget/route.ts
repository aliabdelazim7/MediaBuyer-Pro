import { NextResponse } from 'next/server';
import { AdjustBudgetUseCase } from '@/application/use-cases/AdjustBudgetUseCase';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await req.json();
    const dailyBudget = parseFloat(body.dailyBudget);

    if (isNaN(dailyBudget)) {
      return NextResponse.json({ success: false, error: 'Valid daily budget number is required' }, { status: 400 });
    }

    const adjustUseCase = new AdjustBudgetUseCase();
    const result = await adjustUseCase.execute(campaignId, dailyBudget);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
