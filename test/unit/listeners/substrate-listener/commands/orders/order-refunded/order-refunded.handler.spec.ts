import {
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { OrderStatus } from "@debionetwork/polkadot-provider";
import { OrderRefundedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/orders';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockOrder,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { OrderRefundedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/orders/order-refunded/order-refunded.handler';
import { when } from 'jest-when';
import { TransactionLoggingDto } from '../../../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

describe('Order Refunded Handler Event', () => {
  let orderRefundedHandler: OrderRefundedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

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
        OrderRefundedHandler,
      ],
    }).compile();

    orderRefundedHandler = module.get(OrderRefundedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);

    await module.init();
  });

  it('should defined Order Refunded Handler', () => {
    expect(orderRefundedHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const ORDER = createMockOrder(OrderStatus.Refunded);
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
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 4)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderRefundedCommand: OrderRefundedCommand = new OrderRefundedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderRefundedHandler.execute(orderRefundedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const ORDER = createMockOrder(OrderStatus.Refunded);
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
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 4)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderRefundedCommand: OrderRefundedCommand = new OrderRefundedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    const orderLogging: TransactionLoggingDto = {
      address: orderRefundedCommand.orders.customerId,
      amount: Number(orderRefundedCommand.orders.prices[0].value) / 10 ** 18,
      created_at: new Date(),
      currency: orderRefundedCommand.orders.currency.toUpperCase(),
      parent_id: BigInt(RESULT_TRANSACTION.id),
      ref_number: orderRefundedCommand.orders.id,
      transaction_status: 4,
      transaction_type: 1,
    };

    await orderRefundedHandler.execute(orderRefundedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      orderLogging,
    );
  });
});
