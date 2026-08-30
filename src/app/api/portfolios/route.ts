import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';

export async function GET() {
  try {
    const portfolios = await prisma.businessPortfolio.findMany({
      include: {
        userAccount: {
          select: { id: true, name: true, avatarUrl: true },
        },
        adAccounts: {
          include: {
            campaigns: true,
          },
        },
        pages: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = portfolios.map((p) => {
      const allCampaigns = p.adAccounts.flatMap((a) => a.campaigns);
      const totalSpend = allCampaigns.reduce((acc, c) => acc + c.spend, 0);
      const totalConversions = allCampaigns.reduce((acc, c) => acc + c.conversions, 0);
      const activeCampaigns = allCampaigns.filter((c) => c.status === 'ACTIVE').length;

      return {
        id: p.id,
        name: p.name,
        fbBusinessId: p.fbBusinessId,
        vertical: p.vertical,
        verificationStatus: p.verificationStatus,
        owner: p.userAccount.name,
        ownerAvatar: p.userAccount.avatarUrl,
        adAccountsCount: p.adAccounts.length,
        pagesCount: p.pages.length,
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalConversions,
        activeCampaigns,
        adAccounts: p.adAccounts.map((a) => ({
          id: a.id,
          name: a.name,
          accountId: a.accountId,
          currency: a.currency,
          campaignsCount: a.campaigns.length,
        })),
        pages: p.pages.map((page) => ({
          id: page.id,
          name: page.name,
          pageId: page.pageId,
        })),
      };
    });

    return NextResponse.json({ success: true, portfolios: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
