import { describe, it, expect, beforeEach } from 'vitest';
import { SyncCampaignsUseCase } from '../../src/application/use-cases/SyncCampaignsUseCase';
import { EvaluateRulesUseCase } from '../../src/application/use-cases/EvaluateRulesUseCase';
import { MockMetaGraphClient } from '../../src/infrastructure/meta/MockMetaGraphClient';
import { prisma } from '../../src/infrastructure/db/prisma';

describe('Integration: SyncCampaigns and Auto-Pilot Rules Execution', () => {
  const mockMeta = new MockMetaGraphClient();

  beforeEach(async () => {
    // Clean up DB before test
    await prisma.ruleLog.deleteMany();
    await prisma.automationRule.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.adAccount.deleteMany();
  });

  it('should sync campaigns from MockMeta and store accurate KPI calculations', async () => {
    const syncUseCase = new SyncCampaignsUseCase(mockMeta);
    const syncResult = await syncUseCase.execute('act_test_123');

    expect(syncResult.syncedCount).toBeGreaterThan(0);

    const savedCampaigns = await prisma.campaign.findMany();
    expect(savedCampaigns.length).toBe(4);

    const winningCamp = savedCampaigns.find((c) => c.platformId === 'mock_camp_103');
    expect(winningCamp).toBeDefined();
    expect(winningCamp?.conversions).toBe(45);
    expect(winningCamp?.roas).toBeGreaterThan(4);
  });

  it('should trigger rule and pause losing campaign when CPA exceeds threshold', async () => {
    // 1. Sync campaigns first
    const syncUseCase = new SyncCampaignsUseCase(mockMeta);
    await syncUseCase.execute('act_test_123');

    // 2. Create high CPA kill-switch rule
    const killRule = await prisma.automationRule.create({
      data: {
        name: 'High CPA Kill Switch (> $25)',
        isEnabled: true,
        targetType: 'CAMPAIGN',
        metric: 'CPA',
        operator: 'GREATER_THAN',
        threshold: 25,
        minSpendCondition: 30,
        action: 'PAUSE',
        notifyTelegram: true,
      },
    });

    // 3. Run Evaluate Rules Use Case
    const evaluateUseCase = new EvaluateRulesUseCase(mockMeta);
    const evalResult = await evaluateUseCase.execute();

    expect(evalResult.triggeredCount).toBeGreaterThan(0);

    // 4. Verify losing campaign was paused
    const highCpaCamp = await prisma.campaign.findUnique({
      where: { platformId: 'mock_camp_102' },
    });
    expect(highCpaCamp?.status).toBe('PAUSED');

    // 5. Verify log was recorded
    const logs = await prisma.ruleLog.findMany({ where: { ruleId: killRule.id } });
    expect(logs.length).toBe(1);
    expect(logs[0].actionTaken).toBe('PAUSE');
  });
});
