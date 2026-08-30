import { prisma } from '../../infrastructure/db/prisma';
import { IMetaGraphClient } from '../ports/IMetaGraphClient';
import { MockMetaGraphClient } from '../../infrastructure/meta/MockMetaGraphClient';
import { MetaGraphClient } from '../../infrastructure/meta/MetaGraphClient';
import { SyncCampaignsUseCase } from './SyncCampaignsUseCase';

export class ConnectFacebookAccountUseCase {
  private customClient?: IMetaGraphClient;

  constructor(customClient?: IMetaGraphClient) {
    this.customClient = customClient;
  }

  public async execute(accessToken: string) {
    if (!accessToken || accessToken.trim() === '') {
      throw new Error('Access Token cannot be empty');
    }

    const trimmedToken = accessToken.trim();

    // Determine whether to use Live Meta Client or Mock Client
    let metaClient: IMetaGraphClient;
    if (this.customClient) {
      metaClient = this.customClient;
    } else if (trimmedToken.startsWith('EAA') && !trimmedToken.includes('mock')) {
      // Real Meta Graph API Token
      metaClient = new MetaGraphClient(trimmedToken);
    } else {
      // Sandbox / Test Token
      metaClient = new MockMetaGraphClient();
    }

    // 1. Fetch User Profile from Meta API
    const userProfile = await metaClient.fetchUserProfile(trimmedToken);

    // 2. Upsert Facebook User Account in DB
    const fbUser = await prisma.facebookUserAccount.upsert({
      where: { fbUserId: userProfile.id },
      update: {
        name: userProfile.name,
        accessToken: trimmedToken,
        avatarUrl: userProfile.picture?.data?.url,
        status: 'ACTIVE',
      },
      create: {
        fbUserId: userProfile.id,
        name: userProfile.name,
        accessToken: trimmedToken,
        avatarUrl: userProfile.picture?.data?.url,
        status: 'ACTIVE',
      },
    });

    // 3. Fetch Business Portfolios
    const portfolios = await metaClient.fetchBusinessPortfolios(trimmedToken);
    const discoveredPortfolios = [];

    const syncCampaignsUseCase = new SyncCampaignsUseCase(metaClient);

    for (const portDTO of portfolios) {
      const portfolio = await prisma.businessPortfolio.upsert({
        where: { fbBusinessId: portDTO.id },
        update: {
          name: portDTO.name,
          verificationStatus: portDTO.verification_status || 'VERIFIED',
          vertical: portDTO.vertical || 'ECOMMERCE',
          userAccountId: fbUser.id,
        },
        create: {
          fbBusinessId: portDTO.id,
          name: portDTO.name,
          verificationStatus: portDTO.verification_status || 'VERIFIED',
          vertical: portDTO.vertical || 'ECOMMERCE',
          userAccountId: fbUser.id,
        },
      });

      // 4. Discover Ad Accounts under this portfolio
      let adAccounts: any[] = [];
      try {
        adAccounts = await metaClient.fetchPortfolioAdAccounts(portDTO.id, trimmedToken);
      } catch (err) {
        console.warn(`Could not fetch ad accounts for portfolio ${portDTO.id}:`, err);
      }

      const savedAdAccounts = [];

      for (const adAccDTO of adAccounts) {
        const adAcc = await prisma.adAccount.upsert({
          where: { accountId: adAccDTO.id },
          update: {
            name: adAccDTO.name,
            currency: adAccDTO.currency || 'USD',
            businessPortfolioId: portfolio.id,
            userAccountId: fbUser.id,
          },
          create: {
            accountId: adAccDTO.id,
            name: adAccDTO.name,
            currency: adAccDTO.currency || 'USD',
            businessPortfolioId: portfolio.id,
            userAccountId: fbUser.id,
            status: 'ACTIVE',
          },
        });

        // 5. Sync campaigns for this Ad Account safely
        try {
          await syncCampaignsUseCase.execute(adAcc.accountId);
        } catch (err) {
          console.warn(`Could not sync campaigns for ad account ${adAcc.accountId}:`, err);
        }

        savedAdAccounts.push(adAcc);
      }

      // 6. Discover Pages under this portfolio
      let pages: any[] = [];
      try {
        pages = await metaClient.fetchPortfolioPages(portDTO.id, trimmedToken);
      } catch (err) {
        console.warn(`Could not fetch pages for portfolio ${portDTO.id}:`, err);
      }

      const savedPages = [];

      for (const pageDTO of pages) {
        try {
          const page = await prisma.socialPage.upsert({
            where: { pageId: pageDTO.id },
            update: {
              name: pageDTO.name,
              businessPortfolioId: portfolio.id,
            },
            create: {
              pageId: pageDTO.id,
              name: pageDTO.name,
              businessPortfolioId: portfolio.id,
              isActive: true,
            },
          });
          savedPages.push(page);
        } catch (err) {
          console.warn(`Could not save page ${pageDTO.id}:`, err);
        }
      }

      discoveredPortfolios.push({
        portfolio,
        adAccountsCount: savedAdAccounts.length,
        pagesCount: savedPages.length,
      });
    }

    return {
      user: fbUser,
      portfoliosCount: discoveredPortfolios.length,
      portfolios: discoveredPortfolios,
    };
  }
}
