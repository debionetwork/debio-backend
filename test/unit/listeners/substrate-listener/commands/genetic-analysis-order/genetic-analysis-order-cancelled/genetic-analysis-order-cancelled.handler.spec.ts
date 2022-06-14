import { GeneticAnalysisOrderStatus } from '@debionetwork/polkadot-provider';
import { TransactionLoggingService } from '../../../../../../../src/common';
import { GeneticAnalysisOrderCancelledCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-cancelled/genetic-analysis-order-cancelled.command';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalysisOrder,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisOrderCancelledHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-cancelled/genetic-analysis-order-cancelled.handler';
import { when } from 'jest-when';

describe('Genetic Analysis Order Cancelled Handler Event', () => {
  let geneticAnalysisOrderCancelledHandler: GeneticAnalysisOrderCancelledHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        GeneticAnalysisOrderCancelledHandler,
      ],
    }).compile();

    geneticAnalysisOrderCancelledHandler = module.get(
      GeneticAnalysisOrderCancelledHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);

    await module.init();
  });

  it('should defined GA Order Cancelled Handler', () => {
    expect(geneticAnalysisOrderCancelledHandler).toBeDefined();
  });

  it('should not called logging service Cancelled', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Cancelled,
    );

    const RESULT_STATUS = true;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 17)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrders: GeneticAnalysisOrderCancelledCommand =
      new GeneticAnalysisOrderCancelledCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderCancelledHandler.execute(geneticAnalysisOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service Cancelled', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Cancelled,
    );

    const RESULT_STATUS = { id: 1 };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 17)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrderCancelledCommand: GeneticAnalysisOrderCancelledCommand =
      new GeneticAnalysisOrderCancelledCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderCancelledHandler.execute(
      geneticAnalysisOrderCancelledCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
  });
});
