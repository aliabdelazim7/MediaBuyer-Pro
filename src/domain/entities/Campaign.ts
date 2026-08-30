export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export interface CampaignProps {
  id: string;
  name: string;
  platformId: string;
  adAccountId: string;
  status: CampaignStatus;
  objective: string;
  dailyBudget: number;
  lifetimeBudget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  cpa: number;
  roas: number;
  cpm: number;
  ctr: number;
  lastSyncedAt: Date;
}

export class Campaign {
  private props: CampaignProps;

  constructor(props: CampaignProps) {
    this.props = { ...props };
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get platformId(): string { return this.props.platformId; }
  get adAccountId(): string { return this.props.adAccountId; }
  get status(): CampaignStatus { return this.props.status; }
  get dailyBudget(): number { return this.props.dailyBudget; }
  get spend(): number { return this.props.spend; }
  get conversions(): number { return this.props.conversions; }
  get cpa(): number { return this.props.cpa; }
  get roas(): number { return this.props.roas; }
  get ctr(): number { return this.props.ctr; }
  get cpm(): number { return this.props.cpm; }
  get lastSyncedAt(): Date { return this.props.lastSyncedAt; }

  public toggleStatus(): CampaignStatus {
    this.props.status = this.props.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    return this.props.status;
  }

  public pause(): void {
    this.props.status = 'PAUSED';
  }

  public activate(): void {
    this.props.status = 'ACTIVE';
  }

  public updateBudget(newBudget: number): void {
    if (newBudget < 0) {
      throw new Error('Budget cannot be negative');
    }
    this.props.dailyBudget = Math.round(newBudget * 100) / 100;
  }

  public boostBudgetPercentage(percentage: number): number {
    const factor = 1 + (percentage / 100);
    this.props.dailyBudget = Math.round(this.props.dailyBudget * factor * 100) / 100;
    return this.props.dailyBudget;
  }

  public toJSON(): CampaignProps {
    return { ...this.props };
  }
}
