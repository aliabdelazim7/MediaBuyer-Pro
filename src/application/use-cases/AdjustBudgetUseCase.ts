import { prisma } from '../../infrastructure/db/prisma';
import { IMetaGraphClient } from '../ports/IMetaGraphClient';
import { MockMetaGraphClient } from '../../infrastructure/meta/MockMetaGraphClient';
import { MetaGraphClient } from '../../infrastructure/meta/MetaGraphClient';

export class AdjustBudgetUseCase {
  private customClient?: IMetaGraphClient;

  constructor(customClient?: IMetaGraphClient) {
    this.customClient = customClient;
  }

  public async execute(campaignId: string, newBudget: number) {
    if (newBudget < 1) {
      throw new Error('Daily budget must be at least 1.00');
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        adSets: true,
        adAccount: {
          include: {
            userAccount: true,
            businessPortfolio: {
              include: {
                userAccount: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // 1. Resolve active Meta Access Token from Database
    const token =
      campaign.adAccount?.userAccount?.accessToken ||
      campaign.adAccount?.businessPortfolio?.userAccount?.accessToken ||
      (await prisma.facebookUserAccount.findFirst({ where: { status: 'ACTIVE' }, orderBy: { updatedAt: 'desc' } }))?.accessToken ||
      process.env.META_ACCESS_TOKEN;

    let metaClient: IMetaGraphClient;
    if (this.customClient) {
      metaClient = this.customClient;
    } else if (token && token.startsWith('EAA') && !token.includes('mock')) {
      metaClient = new MetaGraphClient(token);
    } else {
      metaClient = new MockMetaGraphClient();
    }

    // 2. Update Meta API directly (Handles both ABO & CBO)
    const activeAdSets = campaign.adSets.filter((a) => a.status === 'ACTIVE');
    if (activeAdSets.length > 0) {
      // ABO Campaign: Distribute or update active ad sets
      const budgetPerAdSet = Math.round((newBudget / activeAdSets.length) * 100) / 100;
      for (const adset of activeAdSets) {
        try {
          await metaClient.updateAdSetBudget(adset.platformId, budgetPerAdSet, token);
          await prisma.adSet.update({
            where: { id: adset.id },
            data: { dailyBudget: budgetPerAdSet },
          });
        } catch (err: any) {
          console.warn(`Could not update adset budget on Meta API for ${adset.platformId}:`, err);
        }
      }
    } else {
      // CBO Campaign
      try {
        await metaClient.updateCampaignBudget(campaign.platformId, newBudget, token);
      } catch (err: any) {
        console.error(`Failed to update campaign budget on Meta API for ${campaign.platformId}:`, err);
        throw new Error(`Meta API error: ${err.message}`);
      }
    }

    // 3. Update Database
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { dailyBudget: newBudget },
    });

    return {
      id: updated.id,
      name: updated.name,
      dailyBudget: updated.dailyBudget,
    };
  }
}
