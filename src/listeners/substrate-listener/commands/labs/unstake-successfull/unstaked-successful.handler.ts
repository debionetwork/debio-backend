import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../common';
import { LabUnstakedCommand } from './unstaked-successful.command';

@Injectable()
@CommandHandler(LabUnstakedCommand)
export class labUnstakedHandler implements ICommandHandler<LabUnstakedCommand> {
  private readonly logger: Logger = new Logger(LabUnstakedCommand.name);
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: LabUnstakedCommand) {
    const lab = command.lab.normalize();
    await this.logger.log(`Lab ID: ${lab.accountId} Unstaked Successful!`);

    try {
      const tenMinuteInMiliSecond = 10 * 60 * 1000;
      const isLabHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(
          lab.accountId,
          27, // Lab Waiting For Unstaked
        );
      const labParent = await this.loggingService.getLoggingByOrderId(
        lab.accountId,
      );
      const labLogging: TransactionLoggingDto = {
        address: lab.accountId,
        amount: 0,
        created_at: new Date(this.dateTimeProxy.now()),
        currency: 'DBIO',
        parent_id: BigInt(Number(labParent.id)),
        ref_number: lab.accountId,
        transaction_status: 27, // Lab Waiting For Unstaked
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
