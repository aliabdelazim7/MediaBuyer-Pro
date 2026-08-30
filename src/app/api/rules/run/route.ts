import { NextResponse } from 'next/server';
import { EvaluateRulesUseCase } from '@/application/use-cases/EvaluateRulesUseCase';

export async function POST() {
  try {
    const evaluate = new EvaluateRulesUseCase();
    const result = await evaluate.execute();

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
