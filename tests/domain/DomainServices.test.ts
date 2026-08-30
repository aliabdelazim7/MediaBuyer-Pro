import { describe, it, expect } from 'vitest';
import { MetricKPI } from '../../src/domain/value-objects/MetricKPI';
import { RuleEvaluator, CampaignMetrics, RuleDefinition } from '../../src/domain/services/RuleEvaluator';
import { SentimentClassifier } from '../../src/domain/services/SentimentClassifier';

describe('MetricKPI Value Object', () => {
  it('should calculate ROAS correctly', () => {
    const kpi = MetricKPI.create({
      spend: 100,
      revenue: 350,
      conversions: 7,
      impressions: 10000,
      clicks: 250,
    });

    expect(kpi.roas).toBe(3.5);
    expect(kpi.cpa).toBe(14.29); // 100 / 7 rounded
    expect(kpi.ctr).toBe(2.5);   // (250 / 10000) * 100
    expect(kpi.cpm).toBe(10);    // (100 / 10000) * 1000
    expect(kpi.cpc).toBe(0.4);   // 100 / 250
  });

  it('should handle zero conversions and zero impressions gracefully without NaN', () => {
    const kpi = MetricKPI.create({
      spend: 50,
      revenue: 0,
      conversions: 0,
      impressions: 0,
      clicks: 0,
    });

    expect(kpi.roas).toBe(0);
    expect(kpi.cpa).toBe(0);
    expect(kpi.ctr).toBe(0);
    expect(kpi.cpm).toBe(0);
    expect(kpi.cpc).toBe(0);
  });
});

describe('RuleEvaluator Domain Service', () => {
  const evaluator = new RuleEvaluator();

  const campaignMetrics: CampaignMetrics = {
    campaignId: 'camp_123',
    campaignName: 'Black Friday Scaled - EGY',
    spend: 60,
    conversions: 2,
    cpa: 30,
    roas: 1.2,
    ctr: 0.8,
    cpm: 12,
  };

  it('should trigger PAUSE when CPA exceeds maximum allowable threshold and min spend is met', () => {
    const rule: RuleDefinition = {
      id: 'rule_1',
      name: 'High CPA Kill Switch',
      isEnabled: true,
      metric: 'CPA',
      operator: 'GREATER_THAN',
      threshold: 25,
      minSpendCondition: 50,
      action: 'PAUSE',
      notifyTelegram: true,
    };

    const result = evaluator.evaluate(campaignMetrics, rule);
    expect(result.isTriggered).toBe(true);
    expect(result.action).toBe('PAUSE');
    expect(result.reason).toContain('CPA (30) is GREATER_THAN threshold (25)');
  });

  it('should NOT trigger rule if minimum spend condition is not reached', () => {
    const rule: RuleDefinition = {
      id: 'rule_2',
      name: 'High CPA Kill Switch',
      isEnabled: true,
      metric: 'CPA',
      operator: 'GREATER_THAN',
      threshold: 25,
      minSpendCondition: 100, // Campaign only spent 60
      action: 'PAUSE',
      notifyTelegram: true,
    };

    const result = evaluator.evaluate(campaignMetrics, rule);
    expect(result.isTriggered).toBe(false);
  });

  it('should trigger BOOST_BUDGET when ROAS is high', () => {
    const winningCampaign: CampaignMetrics = {
      campaignId: 'camp_456',
      campaignName: 'Winners - Gulf Hijazi',
      spend: 150,
      conversions: 15,
      cpa: 10,
      roas: 4.2,
      ctr: 3.1,
      cpm: 8,
    };

    const scaleRule: RuleDefinition = {
      id: 'rule_3',
      name: 'Scale Winning Campaign',
      isEnabled: true,
      metric: 'ROAS',
      operator: 'GREATER_THAN_OR_EQUAL',
      threshold: 3.5,
      minSpendCondition: 100,
      action: 'BOOST_BUDGET',
      actionParam: 20, // +20%
      notifyTelegram: true,
    };

    const result = evaluator.evaluate(winningCampaign, scaleRule);
    expect(result.isTriggered).toBe(true);
    expect(result.action).toBe('BOOST_BUDGET');
    expect(result.actionParam).toBe(20);
  });
});

describe('SentimentClassifier Domain Service', () => {
  const classifier = new SentimentClassifier();

  it('should classify price and inquiry requests in Egyptian/Arabic dialect', () => {
    const comment = 'بكام ده لو سمحت وفيه مقاس لارج؟';
    const result = classifier.classify(comment);
    expect(result.sentiment).toBe('INQUIRY_PRICE');
    expect(result.intent).toBe('PRICE_INQUIRY');
  });

  it('should classify complaints and negative feedback', () => {
    const comment = 'الأوردر اتأخر جداً والخامة سيئة وتجربة زبالة';
    const result = classifier.classify(comment);
    expect(result.sentiment).toBe('NEGATIVE');
    expect(result.intent).toBe('COMPLAINT');
  });

  it('should classify positive feedback and testimonials', () => {
    const comment = 'ما شاء الله المنتج تحفة والتوصيل سريع جداً شكراً ليكم ❤️';
    const result = classifier.classify(comment);
    expect(result.sentiment).toBe('POSITIVE');
    expect(result.intent).toBe('PRAISE');
  });

  it('should classify spam and unwanted promo links', () => {
    const comment = 'تابعوا صفحتي للربح من الانترنت اضغط على الرابط www.spam.com';
    const result = classifier.classify(comment);
    expect(result.sentiment).toBe('SPAM');
    expect(result.intent).toBe('SPAM');
  });
});
