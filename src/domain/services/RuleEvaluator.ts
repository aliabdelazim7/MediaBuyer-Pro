export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  spend: number;
  conversions: number;
  cpa: number;
  roas: number;
  ctr: number;
  cpm: number;
}

export type MetricType = 'CPA' | 'ROAS' | 'SPEND' | 'CTR' | 'CPM' | 'CONVERSIONS';
export type OperatorType = 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL';
export type ActionType = 'PAUSE' | 'UNPAUSE' | 'BOOST_BUDGET' | 'DECREASE_BUDGET' | 'SEND_ALERT';

export interface RuleDefinition {
  id: string;
  name: string;
  isEnabled: boolean;
  metric: MetricType;
  operator: OperatorType;
  threshold: number;
  minSpendCondition?: number;
  minConversionsCondition?: number;
  action: ActionType;
  actionParam?: number;
  notifyTelegram?: boolean;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  campaignId: string;
  campaignName: string;
  isTriggered: boolean;
  action: ActionType;
  actionParam?: number;
  metricValue: number;
  threshold: number;
  reason: string;
  notifyTelegram: boolean;
}

export class RuleEvaluator {
  public evaluate(metrics: CampaignMetrics, rule: RuleDefinition): RuleEvaluationResult {
    const baseResult: RuleEvaluationResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      campaignId: metrics.campaignId,
      campaignName: metrics.campaignName,
      isTriggered: false,
      action: rule.action,
      actionParam: rule.actionParam,
      metricValue: 0,
      threshold: rule.threshold,
      reason: '',
      notifyTelegram: rule.notifyTelegram ?? true,
    };

    if (!rule.isEnabled) {
      baseResult.reason = 'Rule is disabled';
      return baseResult;
    }

    // Check minimum spend precondition
    if (rule.minSpendCondition && metrics.spend < rule.minSpendCondition) {
      baseResult.reason = `Spend (${metrics.spend}) is less than minimum required spend (${rule.minSpendCondition})`;
      return baseResult;
    }

    // Check minimum conversions precondition
    if (rule.minConversionsCondition && metrics.conversions < rule.minConversionsCondition) {
      baseResult.reason = `Conversions (${metrics.conversions}) less than required (${rule.minConversionsCondition})`;
      return baseResult;
    }

    // Extract metric value
    let metricValue = 0;
    switch (rule.metric) {
      case 'CPA':
        metricValue = metrics.cpa;
        break;
      case 'ROAS':
        metricValue = metrics.roas;
        break;
      case 'SPEND':
        metricValue = metrics.spend;
        break;
      case 'CTR':
        metricValue = metrics.ctr;
        break;
      case 'CPM':
        metricValue = metrics.cpm;
        break;
      case 'CONVERSIONS':
        metricValue = metrics.conversions;
        break;
      default:
        baseResult.reason = `Unsupported metric: ${rule.metric}`;
        return baseResult;
    }

    baseResult.metricValue = metricValue;

    // Evaluate operator
    let isMatch = false;
    switch (rule.operator) {
      case 'GREATER_THAN':
        isMatch = metricValue > rule.threshold;
        break;
      case 'LESS_THAN':
        isMatch = metricValue < rule.threshold;
        break;
      case 'EQUALS':
        isMatch = Math.abs(metricValue - rule.threshold) < 0.001;
        break;
      case 'GREATER_THAN_OR_EQUAL':
        isMatch = metricValue >= rule.threshold;
        break;
      case 'LESS_THAN_OR_EQUAL':
        isMatch = metricValue <= rule.threshold;
        break;
    }

    if (isMatch) {
      baseResult.isTriggered = true;
      baseResult.reason = `Triggered: ${rule.metric} (${metricValue}) is ${rule.operator} threshold (${rule.threshold})`;
    } else {
      baseResult.reason = `Not triggered: ${rule.metric} (${metricValue}) does not satisfy ${rule.operator} ${rule.threshold}`;
    }

    return baseResult;
  }
}
