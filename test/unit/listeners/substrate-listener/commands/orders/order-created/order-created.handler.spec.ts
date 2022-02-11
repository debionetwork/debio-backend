import {
  OrderStatus,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { OrderCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/orders';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockOrder,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { OrderCreatedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/orders/order-created/order-created.handler';
import { when } from 'jest-when';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

describe('Order Created Handler Event', () => {
  let orderCreatedHandler: OrderCreatedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        OrderCreatedHandler,
      ],
    }).compile();

    orderCreatedHandler = module.get(OrderCreatedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);

    await module.init();
  });

  it('should defined Order Cancelled Handler', () => {
    expect(orderCreatedHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
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
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 1)
      .mockReturnValue(RESULT_STATUS);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderCreatedHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
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
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(ORDER.toHuman().id, 1)
      .mockReturnValue(RESULT_STATUS);

    const orderCancelledCommand: OrderCreatedCommand = new OrderCreatedCommand(
      [ORDER],
      mockBlockNumber(),
    );

    await orderCreatedHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
