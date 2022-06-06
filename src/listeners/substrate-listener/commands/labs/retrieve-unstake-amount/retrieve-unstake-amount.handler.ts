import { Logger, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { LabRetrieveUnstakeAmountCommand } from './retrieve-unstake-amount.command';

@Injectable()
@CommandHandler(LabRetrieveUnstakeAmountCommand)
export class LabRetrieveUnstakeAmountHandler
  implements ICommandHandler<LabRetrieveUnstakeAmountCommand>
{
  private readonly logger: Logger = new Logger(
    LabRetrieveUnstakeAmountCommand.name,
  );

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: LabRetrieveUnstakeAmountCommand) {
    const lab = command.lab.normalize();
    await this.logger.log(`Lab ID : ${lab.accountId} Retrieve Unstraked Amount!`);

    try {
      const labParent = await this.loggingService.getLoggingByOrderId(
        lab.accountId,
      );
      const stakingLab = await this.loggingService.getLoggingByHashAndStatus(
        lab.accountId,
        26, // Lab Staked
      );
      const islabHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          lab.accountId,
          25, // Lab Unstaked
        );
      const stakingLogging: TransactionLoggingDto = {
        address: lab.accountId,
        amount: stakingLab.amount,
        created_at: this.dateTimeProxy.new(),
        currency: 'DBIO',
        parent_id: BigInt(labParent.id),
        ref_number: labParent.address,
        transaction_status: 25, // Lab Unstaked
        transaction_type: 6, // Staking Lab
      };
      if (!islabHasBeenInsert) {
        await this.loggingService.create(stakingLogging);
      }
    } catch (error) {
      await this.logger.log(error);
    }
  }
}
