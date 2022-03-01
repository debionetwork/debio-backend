import { Logger, Injectable } from '@nestjs/common';
import { Option } from '@polkadot/types';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderFulfilledCommand } from './order-fulfilled.command';
import {
  convertToDbioUnitString,
  DebioConversionService,
  queryEthAdressByAccountId,
  queryOrderDetailByOrderID,
  queryServiceById,
  queryServiceInvoiceByOrderId,
  RewardService,
  sendRewards,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../common';
import { EscrowService } from '../../../../../common/modules/escrow/escrow.service';
import { TransactionLoggingDto } from '../../../../../common/modules/transaction-logging/dto/transaction-logging.dto';
import { RewardDto } from '../../../../../common/modules/reward/dto/reward.dto';

@Injectable()
@CommandHandler(OrderFulfilledCommand)
export class OrderFulfilledHandler
  implements ICommandHandler<OrderFulfilledCommand>
{
  private readonly logger: Logger = new Logger(OrderFulfilledCommand.name);

  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly exchangeCacheService: DebioConversionService,
    private readonly rewardService: RewardService,
    private readonly escrowService: EscrowService,
    private readonly substrateService: SubstrateService,
  ) {}

  async execute(command: OrderFulfilledCommand) {
    await this.logger.log('Order Fulfilled!');
    const order = command.orders.humanToOrderListenerData();

    try {
      const isOrderHasBeenInsert =
        await this.loggingService.getLoggingByHashAndStatus(order.id, 3);

      const orderHistory = await this.loggingService.getLoggingByOrderId(
        order.id,
      );

      // Logging data input
      const orderLogging: TransactionLoggingDto = {
        address: order.customer_id,
        amount: order.additional_prices[0].value + order.prices[0].value,
        created_at: order.updated_at,
        currency: order.currency.toUpperCase(),
        parent_id: BigInt(orderHistory.id),
        ref_number: order.id,
        transaction_status: 3,
        transaction_type: 1,
      };

      // Logging transaction
      if (!isOrderHasBeenInsert) {
        await this.loggingService.create(orderLogging);
      }

      const resp: any = await queryEthAdressByAccountId(
        this.substrateService.api,
        order['seller_id'],
      );
      if ((resp as Option<any>).isNone) {
        return null;
      }
      const labEthAddress = (resp as Option<any>).unwrap().toString();
      const orderByOrderId = await queryOrderDetailByOrderID(
        this.substrateService.api,
        order.id,
      );
      const serviceByOrderId = await queryServiceById(
        this.substrateService.api,
        order.service_id,
      );
      const totalPrice = order.prices.reduce(
        (acc, price) => acc + price.value,
        0,
      );
      const totalAdditionalPrice = order.additional_prices.reduce(
        (acc, price) => acc + price.value,
        0,
      );
      const amountToForward = totalPrice + totalAdditionalPrice;

      if (
        orderByOrderId['orderFlow'] === 'StakingRequestService' &&
        serviceByOrderId['serviceFlow'] === 'StakingRequestService'
      ) {
        const serviceRequest = await queryServiceInvoiceByOrderId(
          this.substrateService.api,
          order.id,
        );
        const debioToDai = Number(
          (await this.exchangeCacheService.getExchange())['dbioToDai'],
        );
        const servicePrice = (order.prices[0].value + order.additional_prices[0].value) * debioToDai;

        // Send reward to customer
        await sendRewards(
          this.substrateService.api,
          this.substrateService.pair,
          order.customer_id,
          convertToDbioUnitString(servicePrice),
        );

        await queryServiceInvoiceByOrderId(
          this.substrateService.api,
          serviceRequest['hash_'],
        );

        // Write Logging Reward Customer Staking Request Service
        const dataCustomerLoggingInput: RewardDto = {
          address: order.customer_id,
          ref_number: order.id,
          reward_amount: servicePrice,
          reward_type: 'Customer Stake Request Service',
          currency: 'DBIO',
          created_at: new Date(),
        };
        await this.rewardService.insert(dataCustomerLoggingInput);

        // Send reward to lab
        await sendRewards(
          this.substrateService.api,
          this.substrateService.pair,
          order.customer_id,
          convertToDbioUnitString(servicePrice / 10),
        );

        // Write Logging Reward Lab
        const dataLabLoggingInput: RewardDto = {
          address: order.customer_id,
          ref_number: order.id,
          reward_amount: servicePrice / 10,
          reward_type: 'Lab Provide Requested Service',
          currency: 'DBIO',
          created_at: new Date(),
        };
        await this.rewardService.insert(dataLabLoggingInput);
      }

      await this.escrowService.orderFulfilled(order);

      this.logger.log('OrderFulfilled Event');
      this.logger.log('Forwarding payment to lab');
      this.logger.log(`labEthAddress: ${labEthAddress}`);
      this.logger.log(`amountToForward: ${amountToForward}`);
      const tx = await this.escrowService.forwardPaymentToSeller(
        labEthAddress,
        amountToForward,
      );
      this.logger.log(`Forward payment transaction sent | tx -> ${tx}`);
    } catch (err) {
      await this.logger.log(err);
      this.logger.log(`Forward payment failed | err -> ${err}`);
    }
  }
}
