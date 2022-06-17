import { GeneticAnalysisOrderStatus } from '@debionetwork/polkadot-provider';
import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { GeneticAnalysisOrderFulfilledCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalysisOrder,
  dateTimeProxyMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
  transactionLoggingServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisOrderFulfilledHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysis-order-fulfilled/genetic-analysis-order-fulfilled.handler';
import { when } from 'jest-when';
import { NotificationService } from '../../../../../../../src/common/modules/notification/notification.service';

describe('Genetic Analysis Order Fulfilled Handler Event', () => {
  let notificationServiceMock: MockType<NotificationService>;
  let geneticAnalysisOrderFulfilledHandler: GeneticAnalysisOrderFulfilledHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

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
        GeneticAnalysisOrderFulfilledHandler,
      ],
    }).compile();

    geneticAnalysisOrderFulfilledHandler = module.get(
      GeneticAnalysisOrderFulfilledHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    notificationServiceMock = module.get(NotificationService);

    await module.init();
  });

  it('should defined GA Order Fulfilled Handler', () => {
    expect(geneticAnalysisOrderFulfilledHandler).toBeDefined();
  });

  it('should not called logging service Fulfilled', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Fulfilled,
    );

    const RESULT_STATUS = true;

    const RESULT_LOGGING_HISTORY = {
      id: 1,
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 15)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(GA_ORDER.toHuman().id)
      .mockReturnValue(RESULT_LOGGING_HISTORY);

    const geneticAnalysisOrders: GeneticAnalysisOrderFulfilledCommand =
      new GeneticAnalysisOrderFulfilledCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderFulfilledHandler.execute(geneticAnalysisOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service Fulfilled', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Fulfilled,
    );

    const RESULT_STATUS = undefined;

    const RESULT_LOGGING_HISTORY = {
      id: 1,
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 15)
      .mockReturnValue(RESULT_STATUS);

    when(transactionLoggingServiceMock.getLoggingByOrderId)
      .calledWith(GA_ORDER.toHuman().id)
      .mockReturnValue(RESULT_LOGGING_HISTORY);

    const geneticAnalysisOrderFulfilledCommand: GeneticAnalysisOrderFulfilledCommand =
      new GeneticAnalysisOrderFulfilledCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderFulfilledHandler.execute(
      geneticAnalysisOrderFulfilledCommand,
    );
    const transactionLogging = await transactionLoggingServiceMock.create();
    expect(transactionLogging).toEqual(undefined);
    expect(transactionLoggingServiceMock.create).toBeCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalled();
    expect(notificationServiceMock.insert).toBeCalledWith(
      expect.objectContaining({
        role: 'GA',
        entity_type: 'Genetic Analysis Order',
        entity: 'Order Fulfilled',
        description: `You've received ${+GA_ORDER.toHuman().prices[0]
          .value} DBIO for completing the requested analysis for ${
          GA_ORDER.toHuman().geneticAnalysisTrackingId
        }.`,
        read: false,
        deleted_at: null,
        from: 'Debio Network',
        to: GA_ORDER.toHuman().sellerId,
      }),
    );
  });
});
