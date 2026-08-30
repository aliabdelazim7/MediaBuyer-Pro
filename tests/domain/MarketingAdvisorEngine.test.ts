import { describe, it, expect } from 'vitest';
import { MarketingAdvisorEngine } from '../../src/domain/services/MarketingAdvisorEngine';

describe('MarketingAdvisorEngine Domain Service', () => {
  const advisor = new MarketingAdvisorEngine();

  it('should calculate Break-Even ROAS and Target CPA accurately based on unit economics', () => {
    const unitEconomics = {
      sellingPrice: 500, // EGP
      productCost: 200,  // COGS
      shippingAndFulfillment: 50,
      packagingAndConfirmation: 25,
      returnRatePercent: 10, // 10% returns in COD
    };

    const result = advisor.calculateUnitEconomics(unitEconomics);

    expect(result.netProfitBeforeMarketing).toBe(175); // 500 - 200 - 50 - 25 - (500 * 0.1)
    expect(result.breakEvenRoas).toBeCloseTo(2.86, 1); // 500 / 175
    expect(result.maxAllowableCpa).toBe(175);
    expect(result.targetCpa).toBeLessThan(175); // Target CPA should leave profit margin
  });

  it('should diagnose campaign health and detect high CPA money bleeder', () => {
    const campaigns = [
      {
        id: 'c1',
        name: 'Scale Winner Advantage+',
        spend: 200,
        conversions: 40,
        cpa: 5,
        roas: 4.5,
        ctr: 3.2,
        cpm: 3.0,
      },
      {
        id: 'c2',
        name: 'High CPA Bleeder',
        spend: 150,
        conversions: 3,
        cpa: 50,
        roas: 0.8,
        ctr: 1.1,
        cpm: 6.5,
      },
    ];

    const audit = advisor.diagnosePortfolioHealth(campaigns, { targetRoas: 3.0, targetCpa: 15 });

    expect(audit.scalingOpportunities.length).toBe(1);
    expect(audit.scalingOpportunities[0].campaignName).toBe('Scale Winner Advantage+');
    expect(audit.criticalAlerts.length).toBe(1);
    expect(audit.criticalAlerts[0].campaignName).toBe('High CPA Bleeder');
    expect(audit.criticalAlerts[0].actionType).toBe('PAUSE');
  });

  it('should generate viral marketing hooks and video angles tailored for Egyptian and GCC markets', () => {
    const hooks = advisor.generateViralHooks({
      productName: 'حذاء طبي مريح',
      targetMarket: 'EGYPT',
      mainBenefit: 'راحة تامة لأسفل الظهر ومقاوم للماء',
      painPoint: 'ألم الكعب والوقوف لساعات طويلة في الشغل',
    });

    expect(hooks.length).toBeGreaterThanOrEqual(5);
    expect(hooks[0].hookType).toBeDefined();
    expect(hooks[0].hookText).toContain('حذاء');
    expect(hooks.some((h) => h.angle === 'PAIN_RELIEF')).toBe(true);
  });
});
