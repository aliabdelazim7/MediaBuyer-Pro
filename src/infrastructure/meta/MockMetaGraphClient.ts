import { 
  IMetaGraphClient, 
  MetaCampaignDTO, 
  MetaUserProfileDTO, 
  MetaBusinessPortfolioDTO, 
  MetaDiscoveredAdAccountDTO, 
  MetaDiscoveredPageDTO 
} from '../../application/ports/IMetaGraphClient';

export class MockMetaGraphClient implements IMetaGraphClient {
  public async fetchUserProfile(accessToken?: string): Promise<MetaUserProfileDTO> {
    if (accessToken && accessToken.includes('agency')) {
      return {
        id: 'fb_user_agency_888',
        name: 'Ali Abdelazim (Agency Lead)',
        picture: { data: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' } },
      };
    }
    return {
      id: 'fb_user_main_999',
      name: 'Ali Abdelazim (Media Buyer Pro)',
      picture: { data: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' } },
    };
  }

  public async fetchBusinessPortfolios(accessToken?: string): Promise<MetaBusinessPortfolioDTO[]> {
    if (accessToken && accessToken.includes('agency')) {
      return [
        {
          id: 'biz_agency_301',
          name: '🚀 Growth Hacking Agency BM',
          verification_status: 'VERIFIED',
          vertical: 'AGENCY_SERVICES',
        },
      ];
    }

    return [
      {
        id: 'biz_ecommerce_101',
        name: '🛍️ Egyptian Brands & Apparel Portfolio',
        verification_status: 'VERIFIED',
        vertical: 'ECOMMERCE',
      },
      {
        id: 'biz_gulf_202',
        name: '🌍 GCC & Saudi Scaling Portfolio',
        verification_status: 'VERIFIED',
        vertical: 'RETAIL_GLOBAL',
      },
    ];
  }

  public async fetchPortfolioAdAccounts(businessId: string): Promise<MetaDiscoveredAdAccountDTO[]> {
    if (businessId === 'biz_ecommerce_101') {
      return [
        { id: 'act_10111', name: 'Apparel Egypt Main Account', currency: 'EGP', account_status: 1, amount_spent: '45000' },
        { id: 'act_10112', name: 'Footwear & Bags Retargeting', currency: 'EGP', account_status: 1, amount_spent: '18000' },
      ];
    } else if (businessId === 'biz_gulf_202') {
      return [
        { id: 'act_20221', name: 'Saudi Arabia Advantage+ Scaling', currency: 'SAR', account_status: 1, amount_spent: '32000' },
        { id: 'act_20222', name: 'UAE & Kuwait Performance Max', currency: 'USD', account_status: 1, amount_spent: '12500' },
      ];
    } else {
      return [
        { id: 'act_30331', name: 'Client A - Real Estate Leads', currency: 'EGP', account_status: 1, amount_spent: '65000' },
        { id: 'act_30332', name: 'Client B - SaaS Subscriptions', currency: 'USD', account_status: 1, amount_spent: '8900' },
      ];
    }
  }

  public async fetchPortfolioPages(businessId: string): Promise<MetaDiscoveredPageDTO[]> {
    if (businessId === 'biz_ecommerce_101') {
      return [
        { id: 'page_fb_egy_1', name: 'Fashion & Tech Store (Official)', category: 'Clothing & Apparel' },
        { id: 'page_fb_egy_2', name: 'Trendy Footwear Egypt', category: 'Footwear' },
      ];
    } else if (businessId === 'biz_gulf_202') {
      return [
        { id: 'page_fb_gulf_1', name: 'Luxury Scents Gulf', category: 'Health/Beauty' },
      ];
    } else {
      return [
        { id: 'page_fb_agency_1', name: 'Prime Properties New Cairo', category: 'Real Estate' },
      ];
    }
  }

  public async fetchCampaigns(adAccountId: string): Promise<MetaCampaignDTO[]> {
    // If it's a default/test account, return standard IDs
    if (adAccountId === 'act_1234567890' || adAccountId === 'act_test_123') {
      return [
        {
          id: 'mock_camp_101',
          name: '🔥 Mega Flash Sale - Conversions (Egypt)',
          status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          daily_budget: '120.00',
          insights: {
            spend: 115.40,
            impressions: 48500,
            clicks: 1420,
            actions: [{ action_type: 'purchase', value: '18' }],
            action_values: [{ action_type: 'purchase', value: '460.00' }],
            cpc: 0.08,
            cpm: 2.38,
            ctr: 2.93,
          },
        },
        {
          id: 'mock_camp_102',
          name: '⚠️ High CPA Warning - Retargeting DPA',
          status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          daily_budget: '75.00',
          insights: {
            spend: 72.80,
            impressions: 18200,
            clicks: 310,
            actions: [{ action_type: 'purchase', value: '2' }],
            action_values: [{ action_type: 'purchase', value: '54.00' }],
            cpc: 0.23,
            cpm: 4.00,
            ctr: 1.70,
          },
        },
        {
          id: 'mock_camp_103',
          name: '🚀 Winning Creative - Broad Advantage+ (Gulf)',
          status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          daily_budget: '200.00',
          insights: {
            spend: 198.50,
            impressions: 92400,
            clicks: 3850,
            actions: [{ action_type: 'purchase', value: '45' }],
            action_values: [{ action_type: 'purchase', value: '980.00' }],
            cpc: 0.05,
            cpm: 2.15,
            ctr: 4.17,
          },
        },
        {
          id: 'mock_camp_104',
          name: '⏸️ Paused Lead Gen - Real Estate B2B',
          status: 'PAUSED',
          objective: 'OUTCOME_LEADS',
          daily_budget: '50.00',
          insights: {
            spend: 34.20,
            impressions: 9800,
            clicks: 140,
            actions: [{ action_type: 'lead', value: '6' }],
            cpc: 0.24,
            cpm: 3.49,
            ctr: 1.43,
          },
        },
      ];
    }

    const isSaudi = adAccountId.includes('202') || adAccountId.includes('SAR');
    const isAgency = adAccountId.includes('303');

    if (isSaudi) {
      return [
        {
          id: `camp_${adAccountId}_1`,
          name: '🇸🇦 Saudi Broad Advantage+ Top Creative',
          status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          daily_budget: '150.00',
          insights: {
            spend: 142.50,
            impressions: 65000,
            clicks: 2200,
            actions: [{ action_type: 'purchase', value: '28' }],
            action_values: [{ action_type: 'purchase', value: '780.00' }],
            cpc: 0.06,
            cpm: 2.19,
            ctr: 3.38,
          },
        },
      ];
    }

    if (isAgency) {
      return [
        {
          id: `camp_${adAccountId}_1`,
          name: '🏢 Real Estate Villa Leads - New Cairo',
          status: 'ACTIVE',
          objective: 'OUTCOME_LEADS',
          daily_budget: '90.00',
          insights: {
            spend: 85.00,
            impressions: 34000,
            clicks: 850,
            actions: [{ action_type: 'lead', value: '19' }],
            cpc: 0.10,
            cpm: 2.50,
            ctr: 2.50,
          },
        },
      ];
    }

    return [
      {
        id: `camp_${adAccountId}_1`,
        name: `🔥 Mega Flash Sale - Account ${adAccountId}`,
        status: 'ACTIVE',
        objective: 'OUTCOME_SALES',
        daily_budget: '120.00',
        insights: {
          spend: 115.40,
          impressions: 48500,
          clicks: 1420,
          actions: [{ action_type: 'purchase', value: '18' }],
          action_values: [{ action_type: 'purchase', value: '460.00' }],
          cpc: 0.08,
          cpm: 2.38,
          ctr: 2.93,
        },
      },
    ];
  }

  public async updateCampaignStatus(_campaignId: string, _status: 'ACTIVE' | 'PAUSED'): Promise<boolean> {
    return true;
  }

  public async updateCampaignBudget(_campaignId: string, _dailyBudget: number): Promise<boolean> {
    return true;
  }

  public async updateAdSetBudget(_adSetId: string, _dailyBudget: number): Promise<boolean> {
    return true;
  }

  public async replyToComment(commentId: string, _message: string): Promise<{ success: boolean; id?: string }> {
    return { success: true, id: `reply_${commentId}_${Date.now()}` };
  }

  public async sendPrivateReply(_commentId: string, _message: string): Promise<{ success: boolean }> {
    return { success: true };
  }

  public async hideComment(_commentId: string): Promise<boolean> {
    return true;
  }
}
