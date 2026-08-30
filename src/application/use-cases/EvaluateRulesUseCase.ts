import { prisma } from '../../infrastructure/db/prisma';
import { RuleEvaluator, RuleDefinition, CampaignMetrics } from '../../domain/services/RuleEvaluator';
import { IMetaGraphClient } from '../ports/IMetaGraphClient';
import { ITelegramClient } from '../ports/ITelegramClient';
import { MockMetaGraphClient } from '../../infrastructure/meta/MockMetaGraphClient';
import { MetaGraphClient } from '../../infrastructure/meta/MetaGraphClient';
import { TelegramBotClient } from '../../infrastructure/telegram/TelegramBotClient';

export class EvaluateRulesUseCase {
  private evaluator: RuleEvaluator;
  private metaClient: IMetaGraphClient;
  private telegramClient: ITelegramClient;

  constructor(
    metaClient?: IMetaGraphClient,
    telegramClient?: ITelegramClient
  ) {
    this.evaluator = new RuleEvaluator();
    this.metaClient = metaClient || (
      process.env.META_ACCESS_TOKEN && process.env.META_ACCESS_TOKEN !== 'your_system_user_or_page_access_token'
        ? new MetaGraphClient()
        : new MockMetaGraphClient()
    );
    this.telegramClient = telegramClient || new TelegramBotClient();
  }

  public async execute() {
    // 1. Fetch enabled rules
    const rules = await prisma.automationRule.findMany({
      where: { isEnabled: true },
    });

    if (rules.length === 0) {
      return { triggeredCount: 0, actions: [] };
    }

    // 2. Fetch active campaigns
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE' },
    });

    const triggeredActions = [];

    for (const camp of campaigns) {
      const metrics: CampaignMetrics = {
        campaignId: camp.id,
        campaignName: camp.name,
        spend: camp.spend,
        conversions: camp.conversions,
        cpa: camp.cpa,
        roas: camp.roas,
        ctr: camp.ctr,
        cpm: camp.cpm,
      };

      for (const rule of rules) {
        const ruleDef: RuleDefinition = {
          id: rule.id,
          name: rule.name,
          isEnabled: rule.isEnabled,
          metric: rule.metric as any,
          operator: rule.operator as any,
          threshold: rule.threshold,
          minSpendCondition: rule.minSpendCondition ?? undefined,
          minConversionsCondition: rule.minConversionsCondition ?? undefined,
          action: rule.action as any,
          actionParam: rule.actionParam ?? undefined,
          notifyTelegram: rule.notifyTelegram,
        };

        const result = this.evaluator.evaluate(metrics, ruleDef);

        if (result.isTriggered) {
          // Execute Action
          let actionDescription = '';

          if (result.action === 'PAUSE') {
            await this.metaClient.updateCampaignStatus(camp.platformId, 'PAUSED');
            await prisma.campaign.update({
              where: { id: camp.id },
              data: { status: 'PAUSED' },
            });
            actionDescription = `🛑 Automatically PAUSED campaign "${camp.name}"`;
          } else if (result.action === 'BOOST_BUDGET' && result.actionParam) {
            const newBudget = camp.dailyBudget * (1 + result.actionParam / 100);
            await this.metaClient.updateCampaignBudget(camp.platformId, newBudget);
            await prisma.campaign.update({
              where: { id: camp.id },
              data: { dailyBudget: newBudget },
            });
            actionDescription = `🚀 Boosted daily budget by +${result.actionParam}% to $${newBudget.toFixed(2)}`;
          } else if (result.action === 'DECREASE_BUDGET' && result.actionParam) {
            const newBudget = Math.max(5, camp.dailyBudget * (1 - result.actionParam / 100));
            await this.metaClient.updateCampaignBudget(camp.platformId, newBudget);
            await prisma.campaign.update({
              where: { id: camp.id },
              data: { dailyBudget: newBudget },
            });
            actionDescription = `📉 Scaled down daily budget by -${result.actionParam}% to $${newBudget.toFixed(2)}`;
          } else if (result.action === 'SEND_ALERT') {
            actionDescription = `⚠️ Alert triggered for "${camp.name}"`;
          }

          // Save Log to DB
          await prisma.ruleLog.create({
            data: {
              ruleId: rule.id,
              campaignId: camp.id,
              targetName: camp.name,
              actionTaken: result.action,
              reason: result.reason,
              metricValue: result.metricValue,
            },
          });

          await prisma.automationRule.update({
            where: { id: rule.id },
            data: { lastTriggeredAt: new Date() },
          });

          // Send Telegram Notification
          if (rule.notifyTelegram) {
            await this.telegramClient.sendAlertWithActions(
              `⚡ Auto-Pilot Action Triggered: ${rule.name}`,
              `<b>Campaign:</b> ${camp.name}\n` +
              `<b>Action:</b> ${actionDescription}\n` +
              `<b>Reason:</b> ${result.reason}\n` +
              `<b>Current Spend:</b> $${camp.spend.toFixed(2)} | <b>CPA:</b> $${camp.cpa.toFixed(2)} | <b>ROAS:</b> ${camp.roas.toFixed(2)}x`,
              [
                { label: '📊 View Dashboard', actionKey: 'view_camp', payload: camp.id },
                { label: camp.status === 'ACTIVE' ? '🛑 Pause' : '▶️ Resume', actionKey: 'toggle_camp', payload: camp.id },
              ]
            );
          }

          triggeredActions.push({
            ruleId: rule.id,
            ruleName: rule.name,
            campaignId: camp.id,
            campaignName: camp.name,
            action: result.action,
            reason: result.reason,
          });
        }
      }
    }

    return {
      evaluatedCampaigns: campaigns.length,
      evaluatedRules: rules.length,
      triggeredCount: triggeredActions.length,
      triggeredActions,
    };
  }
}
