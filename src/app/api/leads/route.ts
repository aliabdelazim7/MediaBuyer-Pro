import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';

export async function GET() {
  try {
    let leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (leads.length === 0) {
      await prisma.lead.createMany({
        data: [
          {
            name: 'كريم الشناوي',
            phone: '01012345678',
            email: 'karim@example.com',
            source: 'FACEBOOK_COMMENT',
            stage: 'NEW',
            dealValue: 450,
            currency: 'EGP',
            notes: 'سأل عن مقاس 2XL والشحن للإسكندرية',
          },
          {
            name: 'سارة إبراهيم',
            phone: '01198765432',
            email: 'sara@example.com',
            source: 'INSTAGRAM_DM',
            stage: 'QUALIFIED',
            dealValue: 800,
            currency: 'EGP',
            notes: 'ترغب في طلب قطعتين عرض خاص',
          },
          {
            name: 'محمود عبد الفتاح',
            phone: '01234567890',
            source: 'LEAD_FORM',
            stage: 'WON',
            dealValue: 1200,
            currency: 'EGP',
            notes: 'تم تأكيد وشحن الطلب بنجاح',
          },
        ],
      });

      leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, source = 'MANUAL', stage = 'NEW', dealValue = 0, currency = 'EGP', notes } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Lead name is required' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        source,
        stage,
        dealValue: parseFloat(dealValue) || 0,
        currency,
        notes,
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, stage, notes, dealValue } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(stage ? { stage } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(dealValue !== undefined ? { dealValue: parseFloat(dealValue) } : {}),
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
