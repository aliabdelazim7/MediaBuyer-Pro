import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';

export async function GET() {
  try {
    let rules = await prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Auto-seed default high-converting & protection rules if none exist
    if (rules.length === 0) {
      await prisma.automationRule.createMany({
        data: [
          {
            name: '🚨 High CPA Kill Switch (> $25)',
            description: 'Automatically pauses campaign if CPA exceeds $25 after spending at least $30.',
            metric: 'CPA',
            operator: 'GREATER_THAN',
            threshold: 25,
            minSpendCondition: 30,
            action: 'PAUSE',
            notifyTelegram: true,
          },
          {
            name: '🚀 Winning Campaign Scale (+20% Budget)',
            description: 'Scales daily budget by 20% if ROAS is 3.5x or higher with min spend $50.',
            metric: 'ROAS',
            operator: 'GREATER_THAN_OR_EQUAL',
            threshold: 3.5,
            minSpendCondition: 50,
            action: 'BOOST_BUDGET',
            actionParam: 20,
            notifyTelegram: true,
          },
          {
            name: '⚠️ Low CTR Alert (< 1.0%)',
            description: 'Sends Telegram alert when creative CTR drops below 1.0% indicating ad fatigue.',
            metric: 'CTR',
            operator: 'LESS_THAN',
            threshold: 1.0,
            minSpendCondition: 20,
            action: 'SEND_ALERT',
            notifyTelegram: true,
          },
        ],
      });

      rules = await prisma.automationRule.findMany({
        orderBy: { createdAt: 'desc' },
        include: { logs: { orderBy: { createdAt: 'desc' }, take: 5 } },
      });
    }

    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      targetType = 'CAMPAIGN',
      metric,
      operator,
      threshold,
      minSpendCondition = 0,
      action,
      actionParam = 0,
      notifyTelegram = true,
    } = body;

    if (!name || !metric || !operator || threshold === undefined || !action) {
      return NextResponse.json({ success: false, error: 'Missing required rule parameters' }, { status: 400 });
    }

    const rule = await prisma.automationRule.create({
      data: {
        name,
        description,
        targetType,
        metric,
        operator,
        threshold: parseFloat(threshold),
        minSpendCondition: minSpendCondition ? parseFloat(minSpendCondition) : 0,
        action,
        actionParam: actionParam ? parseFloat(actionParam) : 0,
        notifyTelegram: Boolean(notifyTelegram),
        isEnabled: true,
      },
    });

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isEnabled } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Rule ID is required' }, { status: 400 });
    }

    const rule = await prisma.automationRule.update({
      where: { id },
      data: {
        ...(isEnabled !== undefined ? { isEnabled: Boolean(isEnabled) } : {}),
      },
    });

    return NextResponse.json({ success: true, rule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Rule ID is required' }, { status: 400 });
    }

    await prisma.automationRule.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Rule deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
