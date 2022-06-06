import {
  DateTimeProxy,
  DebioConversionService,
  RewardService,
  SubstrateService,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { OrderStatus } from '@debionetwork/polkadot-provider';
import { OrderCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/orders';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockOrder,
  dateTimeProxyMockFactory,
  debioConversionServiceMockFactory,
  escrowServiceMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
  rewardServiceMockFactory,
  substrateServiceMockFactory,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { OrderFulfilledHandler } from '../../../../../../../src/listeners/substrate-listener/commands/orders/order-fulfilled/order-fulfilled.handler';
import { EscrowService } from '../../../../../../../src/common/modules/escrow/escrow.service';
import { NotificationService } from '../../../../../../../src/endpoints/notification/notification.service';
import { when } from 'jest-when';
import { TransactionLoggingDto } from '../../../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

import * as globalProviderMethods from '@debionetwork/polkadot-provider/lib/index';
import * as rewardCommand from '@debionetwork/polkadot-provider/lib/command/rewards';
import * as userProfileQuery from '@debionetwork/polkadot-provider/lib/query/user-profile';
import * as serviceRequestQuery from '@debionetwork/polkadot-provider/lib/query/service-request';
import * as ordersQuery from '@debionetwork/polkadot-provider/lib/query/labs/orders';
import * as servicesQuery from '@debionetwork/polkadot-provider/lib/query/labs/services';

describe('Order Fulfilled Handler Event', () => {
  let orderFulfilledHandler: OrderFulfilledHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let escrowServiceMock: MockType<EscrowService>;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let debioConversionServiceMock: MockType<DebioConversionService>;
  let rewardServiceMock: MockType<RewardService>;
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;

  beforeEach(async () => {
    jest
      .useFakeTimers()
      .setSystemTime(new Date('1970-01-01T00:00:00.001Z').getTime());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: EscrowService,
          useFactory: escrowServiceMockFactory,
        },
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: DebioConversionService,
          useFactory: debioConversionServiceMockFactory,
        },
        {
          provide: RewardService,
          useFactory: rewardServiceMockFactory,
        },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        OrderFulfilledHandler,
      ],
    }).compile();

    orderFulfilledHandler = module.get(OrderFulfilledHandler);
    substrateServiceMock = module.get(SubstrateService);
    escrowServiceMock = module.get(EscrowService);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    debioConversionServiceMock = module.get(DebioConversionService);
    rewardServiceMock = module.get(RewardService);
    notificationServiceMock = module.get(NotificationService); // eslint-disable-line
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Order Fulfilled Handler', () => {
    expect(orderFulfilledHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest
      .spyOn(userProfileQuery, 'queryEthAdressByAccountId')
      .mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest
      .spyOn(ordersQuery, 'queryOrderDetailByOrderID')
      .mockImplementation();
    const queryServiceByIdSpy = jest
      .spyOn(servicesQuery, 'queryServiceById')
      .mockImplementation();
    const queryServiceInvoiceByOrderIdSpy = jest
      .spyOn(serviceRequestQuery, 'queryServiceInvoiceByOrderId')
      .mockImplementation();
    const sendRewardsSpy = jest
      .spyOn(rewardCommand, 'sendRewards')
      .mockImplementation();
    const convertToDbioUnitStringSpy = jest
      .spyOn(globalProviderMethods, 'convertToDbioUnitString')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = true;

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_INVOICE_RETURN = {
      hash_: 'string',
    };

    const SERVICE_RETURN = {
      serviceFlow: 'StakingRequestService',
    };

    const ORDER_DETAIL = {
      orderFlow: 'StakingRequestService',
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string',
      }),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    when(queryEthAdressByAccountIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().sellerId)
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(ORDER_DETAIL);

    when(queryServiceByIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().serviceId)
      .mockReturnValue(SERVICE_RETURN);

    when(queryServiceInvoiceByOrderIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(SERVICE_INVOICE_RETURN);

    convertToDbioUnitStringSpy.mockReturnValue('1');

    debioConversionServiceMock.getExchange.mockReturnValue({
      dbioToDai: '1',
    });

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).not.toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).not.toHaveBeenCalledWith(
      substrateServiceMock.api,
      ORDER.toHuman().sellerId,
    );
    expect(queryOrderDetailByOrderIDSpy).not.toHaveBeenCalled();
    expect(queryServiceByIdSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(debioConversionServiceMock.getExchange).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(rewardServiceMock.insert).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalled();
    expect(rewardServiceMock.insert).not.toHaveBeenCalled();
    expect(escrowServiceMock.orderFulfilled).not.toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).not.toHaveBeenCalled();

    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
    queryServiceInvoiceByOrderIdSpy.mockClear();
    sendRewardsSpy.mockClear();
    convertToDbioUnitStringSpy.mockClear();
  });

  it('should called logging service create', async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest
      .spyOn(userProfileQuery, 'queryEthAdressByAccountId')
      .mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest
      .spyOn(ordersQuery, 'queryOrderDetailByOrderID')
      .mockImplementation();
    const queryServiceByIdSpy = jest
      .spyOn(servicesQuery, 'queryServiceById')
      .mockImplementation();
    const queryServiceInvoiceByOrderIdSpy = jest
      .spyOn(serviceRequestQuery, 'queryServiceInvoiceByOrderId')
      .mockImplementation();
    const sendRewardsSpy = jest
      .spyOn(rewardCommand, 'sendRewards')
      .mockImplementation();
    const convertToDbioUnitStringSpy = jest
      .spyOn(globalProviderMethods, 'convertToDbioUnitString')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = false;

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_INVOICE_RETURN = {
      hash_: 'string',
    };

    const SERVICE_RETURN = {
      serviceFlow: 'StakingRequestService',
    };

    const ORDER_DETAIL = {
      orderFlow: 'StakingRequestService',
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string',
      }),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    when(queryEthAdressByAccountIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().sellerId)
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(ORDER_DETAIL);

    when(queryServiceByIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().serviceId)
      .mockReturnValue(SERVICE_RETURN);

    when(queryServiceInvoiceByOrderIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(SERVICE_INVOICE_RETURN);

    convertToDbioUnitStringSpy.mockReturnValue('1');

    debioConversionServiceMock.getExchange.mockReturnValue({
      dbioToDai: '1',
    });

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    const ORDER_LOGGING_CALLED_WITH: TransactionLoggingDto = {
      address: orderCancelledCommand.orders.customerId,
      amount:
        Number(orderCancelledCommand.orders.additionalPrices[0].value) /
          10 ** 18 +
        Number(orderCancelledCommand.orders.prices[0].value) / 10 ** 18,
      created_at: new Date(),
      currency: orderCancelledCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderCancelledCommand.orders.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      ORDER_LOGGING_CALLED_WITH,
    );
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      ORDER.toHuman().sellerId,
    );
    expect(queryOrderDetailByOrderIDSpy).toHaveBeenCalled();
    expect(queryServiceByIdSpy).toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).toHaveBeenCalled();
    expect(debioConversionServiceMock.getExchange).toHaveBeenCalled();
    expect(sendRewardsSpy).toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).toHaveBeenCalled();
    expect(rewardServiceMock.insert).toHaveBeenCalled();
    expect(sendRewardsSpy).toHaveBeenCalledTimes(2);
    expect(convertToDbioUnitStringSpy).toHaveBeenCalledTimes(2);
    expect(rewardServiceMock.insert).toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).toHaveBeenCalled();

    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
    queryServiceInvoiceByOrderIdSpy.mockClear();
    sendRewardsSpy.mockClear();
    convertToDbioUnitStringSpy.mockClear();
  });

  it('when eth address isNone true', async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest
      .spyOn(userProfileQuery, 'queryEthAdressByAccountId')
      .mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest
      .spyOn(ordersQuery, 'queryOrderDetailByOrderID')
      .mockImplementation();
    const queryServiceByIdSpy = jest
      .spyOn(servicesQuery, 'queryServiceById')
      .mockImplementation();
    const queryServiceInvoiceByOrderIdSpy = jest
      .spyOn(serviceRequestQuery, 'queryServiceInvoiceByOrderId')
      .mockImplementation();
    const sendRewardsSpy = jest
      .spyOn(rewardCommand, 'sendRewards')
      .mockImplementation();
    const convertToDbioUnitStringSpy = jest
      .spyOn(globalProviderMethods, 'convertToDbioUnitString')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = false;

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_INVOICE_RETURN = {
      hash_: 'string',
    };

    const SERVICE_RETURN = {
      serviceFlow: 'StakingRequestService',
    };

    const ORDER_DETAIL = {
      orderFlow: 'StakingRequestService',
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: true,
      unwrap: () => ({
        toString: () => 'string',
      }),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    when(queryEthAdressByAccountIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().sellerId)
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(ORDER_DETAIL);

    when(queryServiceByIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().serviceId)
      .mockReturnValue(SERVICE_RETURN);

    when(queryServiceInvoiceByOrderIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(SERVICE_INVOICE_RETURN);

    convertToDbioUnitStringSpy.mockReturnValue('1');

    debioConversionServiceMock.getExchange.mockReturnValue({
      dbioToDai: '1',
    });

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    const ORDER_LOGGING_CALLED_WITH: TransactionLoggingDto = {
      address: orderCancelledCommand.orders.customerId,
      amount:
        Number(orderCancelledCommand.orders.additionalPrices[0].value) /
          10 ** 18 +
        Number(orderCancelledCommand.orders.prices[0].value) / 10 ** 18,
      created_at: new Date(),
      currency: orderCancelledCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderCancelledCommand.orders.id,
      transaction_status: 3,
      transaction_type: 1,
    };

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      ORDER_LOGGING_CALLED_WITH,
    );
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalled();
    expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      ORDER.toHuman().sellerId,
    );
    expect(queryOrderDetailByOrderIDSpy).not.toHaveBeenCalled();
    expect(queryServiceByIdSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(debioConversionServiceMock.getExchange).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(rewardServiceMock.insert).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalledTimes(2);
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalledTimes(2);
    expect(rewardServiceMock.insert).not.toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).not.toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).not.toHaveBeenCalled();

    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
    queryServiceInvoiceByOrderIdSpy.mockClear();
    sendRewardsSpy.mockClear();
    convertToDbioUnitStringSpy.mockClear();
  });

  it('when order and service flow is not StakingRequestService', async () => {
    // Arrange
    const queryEthAdressByAccountIdSpy = jest
      .spyOn(userProfileQuery, 'queryEthAdressByAccountId')
      .mockImplementation();
    const queryOrderDetailByOrderIDSpy = jest
      .spyOn(ordersQuery, 'queryOrderDetailByOrderID')
      .mockImplementation();
    const queryServiceByIdSpy = jest
      .spyOn(servicesQuery, 'queryServiceById')
      .mockImplementation();
    const queryServiceInvoiceByOrderIdSpy = jest
      .spyOn(serviceRequestQuery, 'queryServiceInvoiceByOrderId')
      .mockImplementation();
    const sendRewardsSpy = jest
      .spyOn(rewardCommand, 'sendRewards')
      .mockImplementation();
    const convertToDbioUnitStringSpy = jest
      .spyOn(globalProviderMethods, 'convertToDbioUnitString')
      .mockImplementation();
    const ORDER = createMockOrder(OrderStatus.Cancelled);

    const RESULT_STATUS = true;

    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 3;
    RESULT_TRANSACTION.transaction_hash = 'string';

    const SERVICE_INVOICE_RETURN = {
      hash_: 'string',
    };

    const SERVICE_RETURN = {
      serviceFlow: '',
    };

    const ORDER_DETAIL = {
      orderFlow: '',
    };

    const ETH_ADDRESS_ACCOUNT_ID_RETURN = {
      isNone: false,
      unwrap: () => ({
        toString: () => 'string',
      }),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 3)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    when(queryEthAdressByAccountIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().sellerId)
      .mockReturnValue(ETH_ADDRESS_ACCOUNT_ID_RETURN);

    when(queryOrderDetailByOrderIDSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(ORDER_DETAIL);

    when(queryServiceByIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().serviceId)
      .mockReturnValue(SERVICE_RETURN);

    when(queryServiceInvoiceByOrderIdSpy)
      .calledWith(substrateServiceMock.api, ORDER.toHuman().id)
      .mockReturnValue(SERVICE_INVOICE_RETURN);

    convertToDbioUnitStringSpy.mockReturnValue('1');

    debioConversionServiceMock.getExchange.mockReturnValue({
      dbioToDai: '1',
    });

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderFulfilledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    // expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledTimes(1);
    // expect(queryEthAdressByAccountIdSpy).toHaveBeenCalledWith(
    //   substrateServiceMock.api,
    //   ORDER.toHuman().sellerId,
    // );
    expect(queryOrderDetailByOrderIDSpy).not.toHaveBeenCalled();
    expect(queryServiceByIdSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(debioConversionServiceMock.getExchange).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalled();
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalled();
    expect(queryServiceInvoiceByOrderIdSpy).not.toHaveBeenCalled();
    expect(rewardServiceMock.insert).not.toHaveBeenCalled();
    expect(sendRewardsSpy).not.toHaveBeenCalledTimes(2);
    expect(convertToDbioUnitStringSpy).not.toHaveBeenCalledTimes(2);
    expect(rewardServiceMock.insert).not.toHaveBeenCalledTimes(2);
    expect(escrowServiceMock.orderFulfilled).not.toHaveBeenCalled();
    expect(escrowServiceMock.forwardPaymentToSeller).not.toHaveBeenCalled();

    queryEthAdressByAccountIdSpy.mockClear();
    queryOrderDetailByOrderIDSpy.mockClear();
    queryServiceByIdSpy.mockClear();
    queryServiceInvoiceByOrderIdSpy.mockClear();
    sendRewardsSpy.mockClear();
    convertToDbioUnitStringSpy.mockClear();
  });
});
