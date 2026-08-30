import { NextResponse } from 'next/server';
import { AnalyzeMarketingStrategyUseCase } from '@/application/use-cases/AnalyzeMarketingStrategyUseCase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get('portfolioId') || undefined;

    const useCase = new AnalyzeMarketingStrategyUseCase();
    const result = await useCase.execute(portfolioId);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, history, unitEconomics, portfolioId } = body;

    const useCase = new AnalyzeMarketingStrategyUseCase();

    // If unit economics calculation requested
    if (unitEconomics) {
      const result = await useCase.execute(portfolioId, unitEconomics);
      return NextResponse.json({ success: true, ...result });
    }

    // If consultation question asked
    if (question) {
      const answer = await useCase.askCMO({
        question,
        history: history || [],
        portfolioId,
      });
      return NextResponse.json({ success: true, answer });
    }

    return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
