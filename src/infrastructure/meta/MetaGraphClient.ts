import { 
  IMetaGraphClient, 
  MetaCampaignDTO, 
  MetaUserProfileDTO, 
  MetaBusinessPortfolioDTO, 
  MetaDiscoveredAdAccountDTO, 
  MetaDiscoveredPageDTO,
  MetaAdSetDTO
} from '../../application/ports/IMetaGraphClient';

import { APP_CONFIG } from '../config/defaults';

export class MetaGraphClient implements IMetaGraphClient {
  private apiVersion = 'v21.0';
  private baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  private defaultAccessToken: string;

  constructor(accessToken?: string) {
    this.defaultAccessToken = accessToken || process.env.META_ACCESS_TOKEN || APP_CONFIG.meta.accessToken;
  }

  private getToken(customToken?: string): string {
    const token = customToken || this.defaultAccessToken || APP_CONFIG.meta.accessToken;
    if (!token) throw new Error('Meta Access Token is missing');
    return token;
  }

  public async fetchUserProfile(accessToken?: string): Promise<MetaUserProfileDTO> {
    const token = this.getToken(accessToken);
    const url = `${this.baseUrl}/me?fields=id,name,picture{url}&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch user profile: ${JSON.stringify(err)}`);
    }
    return res.json();
  }

  public async fetchBusinessPortfolios(accessToken?: string): Promise<MetaBusinessPortfolioDTO[]> {
    const token = this.getToken(accessToken);
    const url = `${this.baseUrl}/me/businesses?fields=id,name,verification_status,vertical,primary_page{id,name}&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to fetch business portfolios: ${JSON.stringify(err)}`);
    }
    const data = await res.json();
    return data.data || [];
  }

  public async fetchPortfolioAdAccounts(businessId: string, accessToken?: string): Promise<MetaDiscoveredAdAccountDTO[]> {
    const token = this.getToken(accessToken);
    const url = `${this.baseUrl}/${businessId}/client_ad_accounts?fields=id,name,currency,account_status,amount_spent&access_token=${token}`;
    const res = await fetch(url);
    
    let accounts: any[] = [];
    if (res.ok) {
      const data = await res.json();
      accounts = data.data || [];
    }

    if (accounts.length === 0) {
      const ownedUrl = `${this.baseUrl}/${businessId}/owned_ad_accounts?fields=id,name,currency,account_status,amount_spent&access_token=${token}`;
      const ownedRes = await fetch(ownedUrl);
      if (ownedRes.ok) {
        const ownedData = await ownedRes.json();
        accounts = ownedData.data || [];
      }
    }

    return accounts;
  }

  public async fetchPortfolioPages(businessId: string, accessToken?: string): Promise<MetaDiscoveredPageDTO[]> {
    const token = this.getToken(accessToken);
    const url = `${this.baseUrl}/${businessId}/owned_pages?fields=id,name,access_token,category,tasks&access_token=${token}`;
    const res = await fetch(url);
    if (!res.ok) {
      const mePagesUrl = `${this.baseUrl}/me/accounts?fields=id,name,access_token,category,tasks&access_token=${token}`;
      const meRes = await fetch(mePagesUrl);
      if (meRes.ok) {
        const meData = await meRes.json();
        return meData.data || [];
      }
      return [];
    }
    const data = await res.json();
    return data.data || [];
  }

  public async fetchCampaigns(adAccountId: string, accessToken?: string, datePreset: string = 'maximum'): Promise<MetaCampaignDTO[]> {
    const token = this.getToken(accessToken);
    const cleanAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const validPreset = datePreset || 'maximum';
    
    // Request full campaign fields including adsets and specified date preset for complete insights
    const fields = `id,name,status,objective,daily_budget,lifetime_budget,adsets{id,name,status,daily_budget,lifetime_budget,insights.date_preset(${validPreset}){spend,actions,action_values}},insights.date_preset(${validPreset}){spend,impressions,clicks,actions,action_values,cpc,cpm,ctr}`;
    const url = `${this.baseUrl}/${cleanAccountId}/campaigns?fields=${fields}&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Meta API error (${res.status}): ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    return (data.data || []).map((item: any) => {
      const rawAdsets = item.adsets?.data || [];

      // Calculate total daily budget from adsets if ABO campaign
      let calculatedDailyBudget = item.daily_budget ? Number(item.daily_budget) / 100 : 0;
      if (calculatedDailyBudget === 0 && rawAdsets.length > 0) {
        const adsetsDailySum = rawAdsets
          .filter((a: any) => a.status === 'ACTIVE' && a.daily_budget)
          .reduce((sum: number, a: any) => sum + (Number(a.daily_budget) / 100), 0);
        calculatedDailyBudget = adsetsDailySum;
      }

      // Format ad sets
      const formattedAdsets: MetaAdSetDTO[] = rawAdsets.map((a: any) => {
        const adsetInsight = a.insights?.data?.[0];
        const adsetSpend = Number(adsetInsight?.spend || 0);
        const adsetPurchases = Number(
          adsetInsight?.actions?.find((x: any) => x.action_type === 'purchase' || x.action_type === 'lead')?.value || 0
        );
        const adsetRevenue = Number(
          adsetInsight?.action_values?.find((x: any) => x.action_type === 'purchase' || x.action_type === 'omni_purchase')?.value || 0
        );
        const adsetCpa = adsetPurchases > 0 ? adsetSpend / adsetPurchases : 0;
        const adsetRoas = adsetSpend > 0 ? adsetRevenue / adsetSpend : 0;

        return {
          id: a.id,
          name: a.name,
          status: a.status,
          daily_budget: a.daily_budget ? (Number(a.daily_budget) / 100).toFixed(2) : undefined,
          lifetime_budget: a.lifetime_budget ? (Number(a.lifetime_budget) / 100).toFixed(2) : undefined,
          insights: {
            spend: adsetSpend,
            conversions: adsetPurchases,
            cpa: Math.round(adsetCpa * 100) / 100,
            roas: Math.round(adsetRoas * 100) / 100,
          },
        };
      });

      return {
        id: item.id,
        name: item.name,
        status: item.status,
        objective: item.objective,
        daily_budget: calculatedDailyBudget > 0 ? calculatedDailyBudget.toFixed(2) : undefined,
        lifetime_budget: item.lifetime_budget ? (Number(item.lifetime_budget) / 100).toFixed(2) : undefined,
        adsets: formattedAdsets,
        insights: item.insights?.data?.[0] ? {
          spend: Number(item.insights.data[0].spend || 0),
          impressions: Number(item.insights.data[0].impressions || 0),
          clicks: Number(item.insights.data[0].clicks || 0),
          actions: item.insights.data[0].actions || [],
          action_values: item.insights.data[0].action_values || [],
          cpc: Number(item.insights.data[0].cpc || 0),
          cpm: Number(item.insights.data[0].cpm || 0),
          ctr: Number(item.insights.data[0].ctr || 0),
        } : undefined,
      };
    });
  }

  public async updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED', accessToken?: string): Promise<boolean> {
    const token = this.getToken(accessToken);
    const url = `${this.baseUrl}/${campaignId}?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update campaign status: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    return json.success === true;
  }

  public async updateCampaignBudget(campaignId: string, dailyBudget: number, accessToken?: string): Promise<boolean> {
    const token = this.getToken(accessToken);
    const budgetInCents = Math.round(dailyBudget * 100);
    const url = `${this.baseUrl}/${campaignId}?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_budget: budgetInCents }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update campaign budget: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    return json.success === true;
  }

  public async updateAdSetBudget(adSetId: string, dailyBudget: number, accessToken?: string): Promise<boolean> {
    const token = this.getToken(accessToken);
    const budgetInCents = Math.round(dailyBudget * 100);
    const url = `${this.baseUrl}/${adSetId}?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_budget: budgetInCents }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to update ad set budget: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    return json.success === true;
  }

  public async replyToComment(commentId: string, message: string, accessToken?: string): Promise<{ success: boolean; id?: string }> {
    const token = this.getToken(accessToken);
    const url = `${this.baseUrl}/${commentId}/comments?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to reply to comment: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    return { success: true, id: json.id };
  }

  public async sendPrivateReply(commentId: string, message: string, accessToken?: string): Promise<{ success: boolean }> {
    const token = this.getToken(accessToken);
    const url = `${this.baseUrl}/${commentId}/private_replies?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to send private reply: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    return { success: json.success === true };
  }

  public async hideComment(commentId: string, accessToken?: string): Promise<boolean> {
    const token = this.getToken(accessToken);
    const url = `${this.baseUrl}/${commentId}?access_token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_hidden: true }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Failed to hide comment: ${JSON.stringify(err)}`);
    }

    const json = await res.json();
    return json.success === true;
  }
}
