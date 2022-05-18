import {
  DateTimeProxy,
  SubstrateService,
} from '../../../../../../../src/common';
import { GeneticAnalysisStatus } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisResultReadyCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalysis,
  mockBlockNumber,
  MockType,
  dateTimeProxyMockFactory,
  notificationServiceMockFactory,
  substrateServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisResultReadyHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis/genetic-analysis-resultready/genetic-analysis-result-ready.handler';
import { NotificationService } from '../../../../../../../src/endpoints/notification/notification.service';
import * as geneticAnalysisOrderCommand from '@debionetwork/polkadot-provider/lib/command/genetic-analyst/genetic-analysis-orders';
import { when } from 'jest-when';
import { NotificationDto } from '../../../../../../../src/endpoints/notification/dto/notification.dto';

jest.mock(
  '@debionetwork/polkadot-provider/lib/command/genetic-analyst/genetic-analysis-orders',
  () => ({
    setGeneticAnalysisOrderFulfilled: jest.fn(),
  }),
);

describe('Genetic Analysis ResultReady Handler Event', () => {
  let geneticAnalysisResultReadyHandler: GeneticAnalysisResultReadyHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        GeneticAnalysisResultReadyHandler,
      ],
    }).compile();

    geneticAnalysisResultReadyHandler = module.get(
      GeneticAnalysisResultReadyHandler,
    );
    substrateServiceMock = module.get(SubstrateService);
    notificationServiceMock = module.get(NotificationService); // eslint-disable-line
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined GA ResultReady Handler', () => {
    expect(geneticAnalysisResultReadyHandler).toBeDefined();
  });

  it('should called Genetic Analysis ResultReady from command bus', async () => {
    // Arrange
    const genetic_analysis = createMockGeneticAnalysis(
      GeneticAnalysisStatus.ResultReady,
    );
    const setResultReadySpy = jest
      .spyOn(geneticAnalysisOrderCommand, 'setGeneticAnalysisOrderFulfilled')
      .mockImplementation();
    const callBack = jest
      .spyOn(geneticAnalysisResultReadyHandler, 'callbackInsertNotificationLogging')
      .mockImplementation();
    const requestData = createMockGeneticAnalysis(
      GeneticAnalysisStatus.ResultReady,
    );

    const customerNotificationInput: NotificationDto = {
      role: 'Customer',
      entity_type: 'Order',
      entity: 'OrderFulfilled',
      description: `Congrats! You’ve got <String> DBIO as a reward for completing the request test for <order_id> from the service requested`,
      read: false,
      created_at: new Date("1"),
      updated_at: new Date("1"),
      deleted_at: null,
      from: 'Debio Network',
      to: "orderId",
    };

    when(callBack)
      .calledWith(customerNotificationInput)
    when(setResultReadySpy)
      .calledWith(
        substrateServiceMock.api,
        substrateServiceMock.pair,
        requestData.toHuman().geneticAnalysisTrackingId,
        () => callBack
      )
      .mockReturnValue(genetic_analysis);

    const geneticAnalysisResultReadyCommand: GeneticAnalysisResultReadyCommand =
      new GeneticAnalysisResultReadyCommand(
        [genetic_analysis],
        mockBlockNumber(),
      );
    await geneticAnalysisResultReadyHandler.execute(
      geneticAnalysisResultReadyCommand,
    );

    expect(setResultReadySpy).toHaveBeenCalled();
  });
});
