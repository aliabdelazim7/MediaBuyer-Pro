import { prisma } from '../../infrastructure/db/prisma';
import { IMetaGraphClient } from '../ports/IMetaGraphClient';
import { MockMetaGraphClient } from '../../infrastructure/meta/MockMetaGraphClient';
import { MetaGraphClient } from '../../infrastructure/meta/MetaGraphClient';

export class ToggleCampaignUseCase {
  private customClient?: IMetaGraphClient;

  constructor(customClient?: IMetaGraphClient) {
    this.customClient = customClient;
  }

  public async execute(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
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

    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

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

    // 2. Update Meta API directly
    try {
      await metaClient.updateCampaignStatus(campaign.platformId, newStatus, token);
    } catch (err: any) {
      console.error(`Failed to update campaign status on Meta API for ${campaign.platformId}:`, err);
      throw new Error(`Meta API error: ${err.message}`);
    }

    // 3. Update Database
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: newStatus },
    });

    return {
      id: updated.id,
      name: updated.name,
      status: updated.status,
    };
  }
}
