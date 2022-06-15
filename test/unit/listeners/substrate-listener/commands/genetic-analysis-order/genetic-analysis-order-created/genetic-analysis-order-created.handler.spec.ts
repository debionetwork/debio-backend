import { GeneticAnalysisOrderStatus } from '@debionetwork/polkadot-provider';
import {
  TransactionLoggingService,
  DateTimeProxy,
} from '../../../../../../../src/common';
import { GeneticAnalysisOrderCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
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
import { GeneticAnalysisOrderCreatedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order/genetic-analysys-order-created/genetic-analysis-order-created.handler';
import { when } from 'jest-when';

describe('Genetic Analysis Order Created Handler Event', () => {
  let geneticAnalysisOrderCreatedHandler: GeneticAnalysisOrderCreatedHandler;
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
        GeneticAnalysisOrderCreatedHandler,
      ],
    }).compile();

    geneticAnalysisOrderCreatedHandler = module.get(
      GeneticAnalysisOrderCreatedHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    notificationServiceMock = module.get(NotificationService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Order Cancelled Handler', () => {
    expect(geneticAnalysisOrderCreatedHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Unpaid,
    );

    const RESULT_STATUS = true;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 13)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrders: GeneticAnalysisOrderCreatedCommand =
      new GeneticAnalysisOrderCreatedCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderCreatedHandler.execute(geneticAnalysisOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(notificationServiceMock.insert).toBeCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const GA_ORDER = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Paid,
    );

    const RESULT_STATUS = false;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(GA_ORDER.toHuman().id, 13)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalysisOrderPaidCommand: GeneticAnalysisOrderCreatedCommand =
      new GeneticAnalysisOrderCreatedCommand([GA_ORDER], mockBlockNumber());

    await geneticAnalysisOrderCreatedHandler.execute(
      geneticAnalysisOrderPaidCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(notificationServiceMock.insert).toBeCalled();
  });
});
