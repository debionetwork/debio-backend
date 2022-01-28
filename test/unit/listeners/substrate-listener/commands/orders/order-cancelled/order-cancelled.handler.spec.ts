import {
  OrderStatus,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { OrderCancelledCommand } from '../../../../../../../src/listeners/substrate-listener/commands/orders';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockOrder,
  escrowServiceMockFactory,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { OrderCancelledHandler } from '../../../../../../../src/listeners/substrate-listener/commands/orders/order-cancelled/order-cancelled.handler';
import { EscrowService } from '../../../../../../../src/common/modules/escrow/escrow.service';
import { when } from 'jest-when';
import { ethers } from 'ethers';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      toUtf8String: jest.fn((val) => val),
    },
  },
}));

describe('Order Cancelled Handler Event', () => {
  let orderCancelledHandler: OrderCancelledHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let escrowServiceMock: MockType<EscrowService>;

  beforeEach(async () => {
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
        OrderCancelledHandler,
      ],
    }).compile();

    orderCancelledHandler = module.get(OrderCancelledHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    escrowServiceMock = module.get(EscrowService);

    await module.init();
  });

  it('should defined Order Cancelled Handler', () => {
    expect(orderCancelledHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const toUtf8StringSpy = jest.spyOn(ethers.utils, 'toUtf8String');
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
      .calledWith(ORDER.toHuman().id, 5)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderCancelledCommand: OrderCancelledCommand =
      new OrderCancelledCommand([ORDER], mockBlockNumber());

    await orderCancelledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(escrowServiceMock.cancelOrder).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const toUtf8StringSpy = jest.spyOn(ethers.utils, 'toUtf8String');
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
      .calledWith(ORDER.toHuman().id, 5)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(ORDER.toHuman().id)
      .mockReturnValue(RESULT_TRANSACTION);

    const orderCancelledCommand: OrderCancelledCommand =
      new OrderCancelledCommand([ORDER], mockBlockNumber());

    await orderCancelledHandler.execute(orderCancelledCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(toUtf8StringSpy).toHaveBeenCalled();
    expect(
      transactionLoggingServiceMock.getLoggingByOrderId,
    ).toHaveBeenCalled();
    expect(escrowServiceMock.cancelOrder).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
