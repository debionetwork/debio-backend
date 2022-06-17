import {
  DateTimeProxy,
  SubstrateService,
} from '../../../../../../../src/common';
import { GeneticAnalysisStatus } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisRejectedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalysis,
  dateTimeProxyMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
  substrateServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisRejectedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis/genetic-analysis-rejected/genetic-analysis-rejected.handler';
import * as geneticAnalysisOrderCommand from '@debionetwork/polkadot-provider/lib/command/genetic-analyst/genetic-analysis-orders';
import { when } from 'jest-when';
import { NotificationService } from '../../../../../../../src/common/modules/notification/notification.service';

jest.mock(
  '@debionetwork/polkadot-provider/lib/command/genetic-analyst/genetic-analysis-orders',
  () => ({
    setGeneticAnalysisOrderRefunded: jest.fn(),
  }),
);

describe('Genetic Analysis Rejected Handler Event', () => {
  let geneticAnalysisRejectedHandler: GeneticAnalysisRejectedHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let notificationServiceMock: MockType<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        GeneticAnalysisRejectedHandler,
      ],
    }).compile();

    geneticAnalysisRejectedHandler = module.get(GeneticAnalysisRejectedHandler);
    substrateServiceMock = module.get(SubstrateService);
    notificationServiceMock = module.get(NotificationService);

    await module.init();
  });

  it('should defined GA Rejected Handler', () => {
    expect(geneticAnalysisRejectedHandler).toBeDefined();
  });

  it('should called Genetic Analysis Rejected from command bus', async () => {
    // Arrange
    const genetic_analysis = createMockGeneticAnalysis(
      GeneticAnalysisStatus.Rejected,
    );
    const setRejectedSpy = jest
      .spyOn(geneticAnalysisOrderCommand, 'setGeneticAnalysisOrderRefunded')
      .mockImplementation();
    const requestData = createMockGeneticAnalysis(
      GeneticAnalysisStatus.Rejected,
    );
    when(setRejectedSpy)
      .calledWith(
        substrateServiceMock.api,
        substrateServiceMock.pair,
        requestData.toHuman().geneticAnalysisTrackingId,
      )
      .mockReturnValue(genetic_analysis);

    const geneticAnalysisRejectedCommand: GeneticAnalysisRejectedCommand =
      new GeneticAnalysisRejectedCommand([genetic_analysis], mockBlockNumber());
    await geneticAnalysisRejectedHandler.execute(
      geneticAnalysisRejectedCommand,
    );

    expect(setRejectedSpy).toHaveBeenCalled();
    expect(setRejectedSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      substrateServiceMock.pair,
      requestData.toHuman().geneticAnalysisTrackingId,
    );
    expect(notificationServiceMock.insert).toHaveBeenCalled();
  });
});
