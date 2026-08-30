import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';
import { SyncCampaignsUseCase } from '@/application/use-cases/SyncCampaignsUseCase';
import { MetaGraphClient } from '@/infrastructure/meta/MetaGraphClient';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get('portfolioId');
    const adAccountId = searchParams.get('adAccountId');
    const datePreset = searchParams.get('datePreset') || 'maximum';
    const refresh = searchParams.get('refresh') === 'true';

    // If live date preset refresh requested or preset is not maximum, sync live data for this timeframe
    if (refresh || (datePreset && datePreset !== 'maximum')) {
      const userAccount = await prisma.facebookUserAccount.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { updatedAt: 'desc' },
      });

      if (userAccount?.accessToken) {
        const client = new MetaGraphClient(userAccount.accessToken);
        const sync = new SyncCampaignsUseCase(client);

        let accountsToSync: Array<{ accountId: string }> = [];
        if (adAccountId && adAccountId !== 'ALL') {
          const acc = await prisma.adAccount.findUnique({ where: { id: adAccountId } });
          if (acc) accountsToSync = [acc];
        } else if (portfolioId && portfolioId !== 'ALL') {
          accountsToSync = await prisma.adAccount.findMany({
            where: { businessPortfolioId: portfolioId },
          });
        } else {
          accountsToSync = await prisma.adAccount.findMany();
        }

        for (const acc of accountsToSync) {
          try {
            await sync.execute(acc.accountId, datePreset);
          } catch (err) {
            console.warn(`Live sync failed for account ${acc.accountId} with preset ${datePreset}:`, err);
          }
        }
      }
    }

    let whereClause: any = {};

    if (adAccountId && adAccountId !== 'ALL') {
      whereClause.adAccountId = adAccountId;
    } else if (portfolioId && portfolioId !== 'ALL') {
      whereClause.adAccount = {
        businessPortfolioId: portfolioId,
      };
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      orderBy: { spend: 'desc' },
      include: {
        adAccount: {
          include: {
            businessPortfolio: true,
          },
        },
        adSets: {
          orderBy: { spend: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, campaigns, datePreset });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const accountId = body.accountId;
    const datePreset = body.datePreset || 'maximum';

    // Find active user account token from DB
    const userAccount = await prisma.facebookUserAccount.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
    });

    const client = userAccount?.accessToken
      ? new MetaGraphClient(userAccount.accessToken)
      : undefined;

    const sync = new SyncCampaignsUseCase(client);

    if (accountId) {
      const result = await sync.execute(accountId, datePreset);
      return NextResponse.json({ success: true, result });
    }

    // If no specific accountId provided, sync all ad accounts in DB
    const allAdAccounts = await prisma.adAccount.findMany();
    let totalSynced = 0;
    for (const acc of allAdAccounts) {
      try {
        const res = await sync.execute(acc.accountId, datePreset);
        totalSynced += res.syncedCount;
      } catch (err) {
        console.warn(`Failed to sync account ${acc.accountId}:`, err);
      }
    }

    return NextResponse.json({ success: true, result: { syncedCount: totalSynced } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
