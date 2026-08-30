export interface RawMetricInputs {
  spend: number;
  revenue?: number;
  conversions?: number;
  impressions?: number;
  clicks?: number;
}

export class MetricKPI {
  public readonly spend: number;
  public readonly revenue: number;
  public readonly conversions: number;
  public readonly impressions: number;
  public readonly clicks: number;
  public readonly roas: number;
  public readonly cpa: number;
  public readonly ctr: number;
  public readonly cpm: number;
  public readonly cpc: number;

  private constructor(inputs: RawMetricInputs) {
    this.spend = Math.max(0, inputs.spend || 0);
    this.revenue = Math.max(0, inputs.revenue || 0);
    this.conversions = Math.max(0, inputs.conversions || 0);
    this.impressions = Math.max(0, inputs.impressions || 0);
    this.clicks = Math.max(0, inputs.clicks || 0);

    // ROAS = Revenue / Spend
    this.roas = this.spend > 0 ? Number((this.revenue / this.spend).toFixed(2)) : 0;

    // CPA = Spend / Conversions
    this.cpa = this.conversions > 0 ? Number((this.spend / this.conversions).toFixed(2)) : 0;

    // CTR % = (Clicks / Impressions) * 100
    this.ctr = this.impressions > 0 ? Number(((this.clicks / this.impressions) * 100).toFixed(2)) : 0;

    // CPM = (Spend / Impressions) * 1000
    this.cpm = this.impressions > 0 ? Number(((this.spend / this.impressions) * 1000).toFixed(2)) : 0;

    // CPC = Spend / Clicks
    this.cpc = this.clicks > 0 ? Number((this.spend / this.clicks).toFixed(2)) : 0;
  }

  public static create(inputs: RawMetricInputs): MetricKPI {
    return new MetricKPI(inputs);
  }
}
