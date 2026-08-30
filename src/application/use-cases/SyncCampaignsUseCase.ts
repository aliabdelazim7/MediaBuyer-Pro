import { prisma } from '../../infrastructure/db/prisma';
import { IMetaGraphClient } from '../ports/IMetaGraphClient';
import { MockMetaGraphClient } from '../../infrastructure/meta/MockMetaGraphClient';
import { MetaGraphClient } from '../../infrastructure/meta/MetaGraphClient';
import { MetricKPI } from '../../domain/value-objects/MetricKPI';

export class SyncCampaignsUseCase {
  private metaClient: IMetaGraphClient;

  constructor(customClient?: IMetaGraphClient) {
    if (customClient) {
      this.metaClient = customClient;
    } else if (process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN !== 'your_system_user_or_page_access_token') {
      this.metaClient = new MetaGraphClient();
    } else {
      this.metaClient = new MockMetaGraphClient();
    }
  }

  public async execute(adAccountId: string = 'act_1234567890', datePreset: string = 'maximum') {
    // 1. Ensure AdAccount exists in DB
    let account = await prisma.adAccount.findUnique({
      where: { accountId: adAccountId },
    });

    if (!account) {
      account = await prisma.adAccount.create({
        data: {
          accountId: adAccountId,
          name: 'Main E-Commerce Ad Account',
          currency: 'USD',
          platform: 'META',
          status: 'ACTIVE',
        },
      });
    }

    // 2. Fetch campaigns from Meta Graph Client with specific date preset
    const metaCampaigns = await this.metaClient.fetchCampaigns(adAccountId, undefined, datePreset);

    const syncedResults = [];

    for (const item of metaCampaigns) {
      const insights = item.insights || { spend: 0, impressions: 0, clicks: 0, actions: [], action_values: [] };
      
      // Extract exact primary result matching Meta Ads Manager "Results" column
      const messagingStarted = Number(
        insights.actions?.find((a) => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value || 0
      );
      const purchases = Number(
        insights.actions?.find((a) => a.action_type === 'purchase' || a.action_type === 'omni_purchase')?.value || 0
      );
      const leads = Number(
        insights.actions?.find((a) => a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped')?.value || 0
      );
      const otherConversions = Number(
        insights.actions?.find((a) => a.action_type === 'complete_registration' || a.action_type === 'submit_application')?.value || 0
      );

      // Match exact Meta Results hierarchy
      let totalConversions = 0;
      if (messagingStarted > 0) {
        totalConversions = messagingStarted;
      } else if (purchases > 0) {
        totalConversions = purchases;
      } else if (leads > 0) {
        totalConversions = leads;
      } else if (otherConversions > 0) {
        totalConversions = otherConversions;
      } else {
        totalConversions = Number(
          insights.actions?.find((a) => a.action_type === 'onsite_conversion.total_messaging_connection' || a.action_type === 'contact')?.value || 0
        );
      }

      const revenue = Number(
        insights.action_values?.find((a) => a.action_type === 'purchase' || a.action_type === 'omni_purchase')?.value || 0
      );

      const kpis = MetricKPI.create({
        spend: insights.spend,
        revenue: revenue,
        conversions: totalConversions,
        impressions: insights.impressions,
        clicks: insights.clicks,
      });

      const campaign = await prisma.campaign.upsert({
        where: { platformId: item.id },
        update: {
          adAccountId: account.id,
          name: item.name,
          status: item.status,
          objective: item.objective || 'OUTCOME_SALES',
          dailyBudget: item.daily_budget ? parseFloat(item.daily_budget) : 0,
          lifetimeBudget: item.lifetime_budget ? parseFloat(item.lifetime_budget) : 0,
          spend: kpis.spend,
          impressions: kpis.impressions,
          clicks: kpis.clicks,
          cpc: kpis.cpc,
          cpm: kpis.cpm,
          ctr: kpis.ctr,
          conversions: kpis.conversions,
          cpa: kpis.cpa,
          roas: kpis.roas,
          conversionValue: kpis.revenue,
          lastSyncedAt: new Date(),
        },
        create: {
          platformId: item.id,
          adAccountId: account.id,
          name: item.name,
          status: item.status,
          objective: item.objective || 'OUTCOME_SALES',
          dailyBudget: item.daily_budget ? parseFloat(item.daily_budget) : 0,
          lifetimeBudget: item.lifetime_budget ? parseFloat(item.lifetime_budget) : 0,
          spend: kpis.spend,
          impressions: kpis.impressions,
          clicks: kpis.clicks,
          cpc: kpis.cpc,
          cpm: kpis.cpm,
          ctr: kpis.ctr,
          conversions: kpis.conversions,
          cpa: kpis.cpa,
          roas: kpis.roas,
          conversionValue: kpis.revenue,
          lastSyncedAt: new Date(),
        },
      });

      // 3. Sync underlying Ad Sets if available
      if (item.adsets && item.adsets.length > 0) {
        for (const adset of item.adsets) {
          await prisma.adSet.upsert({
            where: { platformId: adset.id },
            update: {
              name: adset.name,
              status: adset.status,
              dailyBudget: adset.daily_budget ? parseFloat(adset.daily_budget) : 0,
              spend: adset.insights?.spend || 0,
              conversions: adset.insights?.conversions || 0,
              cpa: adset.insights?.cpa || 0,
              roas: adset.insights?.roas || 0,
              lastSyncedAt: new Date(),
            },
            create: {
              platformId: adset.id,
              campaignId: campaign.id,
              name: adset.name,
              status: adset.status,
              dailyBudget: adset.daily_budget ? parseFloat(adset.daily_budget) : 0,
              spend: adset.insights?.spend || 0,
              conversions: adset.insights?.conversions || 0,
              cpa: adset.insights?.cpa || 0,
              roas: adset.insights?.roas || 0,
              lastSyncedAt: new Date(),
            },
          });
        }
      }

      syncedResults.push(campaign);
    }

    return {
      syncedCount: syncedResults.length,
      campaigns: syncedResults,
    };
  }
}
