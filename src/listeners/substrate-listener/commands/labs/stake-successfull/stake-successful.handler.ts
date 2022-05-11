import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  TransactionLoggingService,
  DateTimeProxy,
} from '../../../../../common';
import { LabStakeSuccessfulCommand } from './stake-successful.command';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';

@Injectable()
@CommandHandler(LabStakeSuccessfulCommand)
export class LabStakeSuccessfullHandler
  implements ICommandHandler<LabStakeSuccessfulCommand>
{
  private readonly logger: Logger = new Logger(LabStakeSuccessfulCommand.name);
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: LabStakeSuccessfulCommand) {
    await this.logger.log('Lab Stake Successful!');

    const lab = command.labs.normalize();

    try {
      const isLabHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          lab.accountId,
          26, // Lab Staked
        );
      const labParent = await this.loggingService.getLoggingByOrderId(
        lab.accountId,
      );
      const labLogging: TransactionLoggingDto = {
        address: lab.accountId,
        amount: lab.stakeAmount,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(Number(labParent.id)) || BigInt(0),
        ref_number: lab.accountId,
        transaction_status: 26, // Lab Staked
        transaction_type: 6, // Staking Lab
      };
      if (!isLabHasBeenInsert) {
        await this.loggingService.create(labLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
