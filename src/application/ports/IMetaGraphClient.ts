export interface MetaUserProfileDTO {
  id: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface MetaBusinessPortfolioDTO {
  id: string;
  name: string;
  verification_status?: string;
  vertical?: string;
  primary_page?: { id: string; name: string };
}

export interface MetaDiscoveredAdAccountDTO {
  id: string;
  name: string;
  currency: string;
  account_status?: number;
  amount_spent?: string;
}

export interface MetaDiscoveredPageDTO {
  id: string;
  name: string;
  access_token?: string;
  category?: string;
  tasks?: string[];
}

export interface MetaAdSetDTO {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  daily_budget?: string;
  lifetime_budget?: string;
  insights?: {
    spend: number;
    conversions: number;
    cpa: number;
    roas: number;
  };
}

export interface MetaCampaignDTO {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  adsets?: MetaAdSetDTO[];
  insights?: {
    spend: number;
    impressions: number;
    clicks: number;
    actions?: Array<{ action_type: string; value: string }>;
    action_values?: Array<{ action_type: string; value: string }>;
    cpc?: number;
    cpm?: number;
    ctr?: number;
  };
}

export interface MetaCommentDTO {
  id: string;
  message: string;
  created_time: string;
  from: {
    id: string;
    name: string;
  };
  post_id?: string;
}

export interface IMetaGraphClient {
  fetchUserProfile(accessToken?: string): Promise<MetaUserProfileDTO>;
  fetchBusinessPortfolios(accessToken?: string): Promise<MetaBusinessPortfolioDTO[]>;
  fetchPortfolioAdAccounts(businessId: string, accessToken?: string): Promise<MetaDiscoveredAdAccountDTO[]>;
  fetchPortfolioPages(businessId: string, accessToken?: string): Promise<MetaDiscoveredPageDTO[]>;
  fetchCampaigns(adAccountId: string, accessToken?: string, datePreset?: string): Promise<MetaCampaignDTO[]>;
  updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED', accessToken?: string): Promise<boolean>;
  updateCampaignBudget(campaignId: string, dailyBudget: number, accessToken?: string): Promise<boolean>;
  updateAdSetBudget(adSetId: string, dailyBudget: number, accessToken?: string): Promise<boolean>;
  replyToComment(commentId: string, message: string, accessToken?: string): Promise<{ success: boolean; id?: string }>;
  sendPrivateReply(commentId: string, message: string, accessToken?: string): Promise<{ success: boolean }>;
  hideComment(commentId: string, accessToken?: string): Promise<boolean>;
}
