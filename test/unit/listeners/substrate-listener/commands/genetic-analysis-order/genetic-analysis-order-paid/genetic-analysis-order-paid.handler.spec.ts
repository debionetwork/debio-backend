import {
  GeneticAnalysisOrderStatus,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { GeneticAnalysisOrderPaidCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalysisOrder,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisOrderPaidHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-paid/genetic-analysis-order-paid.handler';
import { when } from 'jest-when';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

describe('Genetic Analysis Order Paid Handler Event', () => {
  let geneticAnalysisOrderPaidHandler: GeneticAnalysisOrderPaidHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        GeneticAnalysisOrderPaidHandler,
      ],
    }).compile();

    geneticAnalysisOrderPaidHandler = module.get(
      GeneticAnalysisOrderPaidHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);

    await module.init();
  });

  it('should defined GA Order Paid Handler', () => {
    expect(geneticAnalysisOrderPaidHandler).toBeDefined();
  });

  it('should not called logging service paid', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Paid,
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
      .calledWith(GA_ORDER.toHuman().id, 14)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrders: GeneticAnalysisOrderPaidCommand =
      new GeneticAnalysisOrderPaidCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderPaidHandler.execute(geneticAnalysisOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service paid', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Paid,
    );

    const RESULT_STATUS = { id: 1 };
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
      .calledWith(GA_ORDER.toHuman().id, 14)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrderPaidCommand: GeneticAnalysisOrderPaidCommand =
      new GeneticAnalysisOrderPaidCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderPaidHandler.execute(
      geneticAnalysisOrderPaidCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
  });
});
