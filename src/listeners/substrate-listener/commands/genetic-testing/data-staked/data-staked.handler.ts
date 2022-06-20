import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DebioConversionService,
  TransactionLoggingService,
  SubstrateService,
} from '../../../../../common';
import {
  convertToDbioUnitString,
  sendRewards,
} from '@debionetwork/polkadot-provider';
import { DataStakedCommand } from './data-staked.command';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';

@Injectable()
@CommandHandler(DataStakedCommand)
export class DataStakedHandler implements ICommandHandler<DataStakedCommand> {
  private readonly logger: Logger = new Logger(DataStakedCommand.name);
  constructor(
    private readonly transactionLoggingService: TransactionLoggingService,
    private readonly exchangeCacheService: DebioConversionService,
    private readonly substrateService: SubstrateService,
  ) {}

  async execute(command: DataStakedCommand) {
    const dataStaked = command.dataStaked;

    await this.logger.log(
      `Data Staked With Hash Data Bounty: ${dataStaked.hashDataBounty}!`,
    );
    const dataOrder = await (
      await this.substrateService.api.query.orders.orders(dataStaked.orderId)
    ).toJSON();

    const debioToDai = Number(
      (await this.exchangeCacheService.getExchange())['dbioToDai'],
    );
    const rewardPrice = dataOrder['price'][0].value * debioToDai;

    //send reward
    await sendRewards(
      this.substrateService.api as any,
      this.substrateService.pair,
      dataOrder['customer_id'],
      convertToDbioUnitString(rewardPrice),
    );

    // Write Transaction Logging Reward Customer Staking Request Service
    const dataCustomerLoggingInput: TransactionLoggingDto = {
      address: dataOrder['customerId'],
      amount: rewardPrice,
      created_at: new Date(),
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: dataOrder['id'],
      transaction_type: 8,
      transaction_status: 34,
    };
    await this.transactionLoggingService.create(dataCustomerLoggingInput);
  }
}
