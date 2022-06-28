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
    const lab = command.labs.normalize();
    await this.logger.log(`Lab ID: ${lab.accountId} Stake Successful!`);

    try {
      const tenMinuteInMiliSecond = 10 * 60 * 1000;
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
      let isLabHasBeenInsertTenMinuteAgo = false;

      if (isLabHasBeenInsert) {
        isLabHasBeenInsertTenMinuteAgo =
          Number(new Date(new Date(this.dateTimeProxy.now())).getTime()) -
            Number(new Date(isLabHasBeenInsert.created_at).getTime()) <=
          tenMinuteInMiliSecond;
      }
      if (!isLabHasBeenInsert || isLabHasBeenInsertTenMinuteAgo === false) {
        await this.loggingService.create(labLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
