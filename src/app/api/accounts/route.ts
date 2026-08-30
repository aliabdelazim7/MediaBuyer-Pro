import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';
import { ConnectFacebookAccountUseCase } from '@/application/use-cases/ConnectFacebookAccountUseCase';

export async function GET() {
  try {
    const accounts = await prisma.facebookUserAccount.findMany({
      include: {
        portfolios: {
          include: {
            adAccounts: {
              include: {
                campaigns: {
                  select: {
                    id: true,
                    status: true,
                    spend: true,
                    conversions: true,
                  },
                },
              },
            },
            pages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json({ success: false, error: 'Access token is required' }, { status: 400 });
    }

    const connect = new ConnectFacebookAccountUseCase();
    const result = await connect.execute(accessToken);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Account ID is required' }, { status: 400 });
    }

    await prisma.facebookUserAccount.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Account disconnected successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
