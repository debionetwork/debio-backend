import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { DateTimeProxy, RewardService } from '../../../../../common';
import { RewardFundsCommand } from './reward-fund.command';
import { NotificationDto } from '../../../../..//endpoints/notification/dto/notification.dto';

@Injectable()
@CommandHandler(RewardFundsCommand)
export class RewardFundsHandler implements ICommandHandler<RewardFundsCommand> {
  private readonly logger: Logger = new Logger(RewardFundsCommand.name);
  constructor(
    private readonly rewardLoggingService: RewardService,
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}
  async execute(command: RewardFundsCommand) {
    await this.logger.log('Reward Funds!');

    const reward = command.rewards;
    try {
      const lastReward =
        await this.rewardLoggingService.getLastRewardByAccountId(
          reward['accountId'],
        );
      let description: string;

      switch (lastReward['reward_type']) {
        case 'Registered User':
          description = `Congrats! You’ve got ${reward['amount']} DBIO from wallet binding.`;
          break;
        case 'Lab Verified':
          description = `Congrats! You’ve got ${reward['amount']} DBIO from account verification.`;
          break;
        case 'Reward from Data Bounty':
          description = `Congrats! You’ve got ${reward['amount']} DBIO as a reward for submitting a data bounty.`;
          break;
        case 'Reward from Request Service':
          description = `Congrats! You’ve got ${reward['amount']} DBIO as a reward for completing the request test for <Specimen Number> from the service requested`;
          break;
      }

      const notificationRewardLogging: NotificationDto = {
        role: null,
        entity_type: null,
        entity: null,
        description,
        read: false,
        created_at: await this.dateTimeProxy.new(),
        updated_at: await this.dateTimeProxy.new(),
        deleted_at: null,
        from: null,
        to: reward.accountId,
      };

      await this.notificationService.insert(notificationRewardLogging);
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
