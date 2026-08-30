import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/db/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get('portfolioId');
    const adAccountId = searchParams.get('adAccountId');

    let whereCampaign: any = {};
    if (adAccountId && adAccountId !== 'ALL') {
      whereCampaign.adAccountId = adAccountId;
    } else if (portfolioId && portfolioId !== 'ALL') {
      whereCampaign.adAccount = { businessPortfolioId: portfolioId };
    }

    const campaigns = await prisma.campaign.findMany({ where: whereCampaign });
    const rules = await prisma.automationRule.findMany();
    const comments = await prisma.comment.findMany();
    const leads = await prisma.lead.findMany();
    const logs = await prisma.ruleLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + c.conversionValue, 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
    const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
    const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

    const pendingComments = comments.filter((c) => c.status === 'PENDING').length;
    const highIntentComments = comments.filter((c) => c.sentiment === 'INQUIRY_PRICE').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalSpend: Math.round(totalSpend * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalConversions,
        avgRoas: Math.round(avgRoas * 100) / 100,
        avgCpa: Math.round(avgCpa * 100) / 100,
        activeCampaigns,
        totalCampaigns: campaigns.length,
        totalRules: rules.length,
        activeRules: rules.filter((r) => r.isEnabled).length,
        pendingComments,
        highIntentComments,
        totalLeads: leads.length,
      },
      recentLogs: logs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
