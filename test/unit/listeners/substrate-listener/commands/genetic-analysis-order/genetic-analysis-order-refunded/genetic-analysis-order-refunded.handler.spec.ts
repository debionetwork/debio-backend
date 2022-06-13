import { GeneticAnalysisOrderStatus } from '@debionetwork/polkadot-provider';
import { DateTimeProxy, TransactionLoggingService } from '../../../../../../../src/common';
import { GeneticAnalysisOrderRefundedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../../../../../../../src/endpoints/notification/notification.service';
import {
  createMockGeneticAnalysisOrder,
  dateTimeProxyMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisOrderRefundedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-refunded/genetic-analysis-order-refunded.handler';
import { when } from 'jest-when';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

describe('Genetic Analysis Order Refunded Handler Event', () => {
  let geneticAnalysisOrderRefundedHandler: GeneticAnalysisOrderRefundedHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>; // eslint-disable-line

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        GeneticAnalysisOrderRefundedHandler,
      ],
    }).compile();

    geneticAnalysisOrderRefundedHandler = module.get(
      GeneticAnalysisOrderRefundedHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    notificationServiceMock = module.get(NotificationService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line
    
    await module.init();
  });

  it('should defined GA Order Refunded Handler', () => {
    expect(geneticAnalysisOrderRefundedHandler).toBeDefined();
  });

  it('should not called logging service Refunded', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Refunded,
    );

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
      .calledWith(GA_ORDER.toHuman().id, 16)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrders: GeneticAnalysisOrderRefundedCommand =
      new GeneticAnalysisOrderRefundedCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderRefundedHandler.execute(geneticAnalysisOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(notificationServiceMock.insert).not.toBeCalled();
  });

  it('should called logging service Refunded', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Refunded,
    );

    const RESULT_STATUS = false;
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(1);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 16)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrderRefundedCommand: GeneticAnalysisOrderRefundedCommand =
      new GeneticAnalysisOrderRefundedCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderRefundedHandler.execute(
      geneticAnalysisOrderRefundedCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
  });
});
