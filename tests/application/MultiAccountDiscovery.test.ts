import { describe, it, expect, beforeEach } from 'vitest';
import { ConnectFacebookAccountUseCase } from '../../src/application/use-cases/ConnectFacebookAccountUseCase';
import { MockMetaGraphClient } from '../../src/infrastructure/meta/MockMetaGraphClient';
import { prisma } from '../../src/infrastructure/db/prisma';

describe('Integration: Multi-Account and Business Portfolio Discovery', () => {
  const mockMeta = new MockMetaGraphClient();

  beforeEach(async () => {
    await prisma.ruleLog.deleteMany();
    await prisma.automationRule.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.socialPage.deleteMany();
    await prisma.adAccount.deleteMany();
    await prisma.businessPortfolio.deleteMany();
    await prisma.facebookUserAccount.deleteMany();
  });

  it('should discover and link all Business Portfolios, Ad Accounts, and Pages for a connected Facebook account', async () => {
    const useCase = new ConnectFacebookAccountUseCase(mockMeta);

    const result = await useCase.execute('EAAB_mock_token_123');

    expect(result.user.name).toContain('Ali Abdelazim');
    expect(result.portfoliosCount).toBe(2);

    // Verify DB records
    const savedUser = await prisma.facebookUserAccount.findUnique({
      where: { id: result.user.id },
      include: {
        portfolios: {
          include: {
            adAccounts: {
              include: { campaigns: true },
            },
            pages: true,
          },
        },
      },
    });

    expect(savedUser).toBeDefined();
    expect(savedUser?.portfolios.length).toBe(2);

    const egyPortfolio = savedUser?.portfolios.find((p) => p.fbBusinessId === 'biz_ecommerce_101');
    expect(egyPortfolio).toBeDefined();
    expect(egyPortfolio?.adAccounts.length).toBe(2);
    expect(egyPortfolio?.pages.length).toBe(2);

    const firstAdAccount = egyPortfolio?.adAccounts[0];
    expect(firstAdAccount?.campaigns.length).toBeGreaterThan(0);
  });

  it('should support adding a second Facebook Account with different portfolios and agency assets', async () => {
    const useCase = new ConnectFacebookAccountUseCase(mockMeta);

    // 1. Connect First Account
    await useCase.execute('token_ecommerce_personal');

    // 2. Connect Second Agency Account
    const agencyResult = await useCase.execute('token_agency_pro');

    expect(agencyResult.user.name).toContain('Agency Lead');
    expect(agencyResult.portfoliosCount).toBe(1);

    const allUsers = await prisma.facebookUserAccount.findMany();
    expect(allUsers.length).toBe(2);

    const allPortfolios = await prisma.businessPortfolio.findMany();
    expect(allPortfolios.length).toBe(3);
  });
});
