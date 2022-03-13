import { SubstrateService } from '../../../../../../../src/common';
import { GeneticAnalysisStatus } from '@debionetwork/polkadot-provider';
import { GeneticAnalysisResultReadyCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalysis,
  mockBlockNumber,
  MockType,
  substrateServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisResultReadyHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis/genetic-analysis-resultready/genetic-analysis-result-ready.handler';
import * as geneticAnalysisOrderCommand from '@debionetwork/polkadot-provider/lib/command/genetic-analyst/genetic-analysis-orders';
import { when } from 'jest-when';

jest.mock(
  '@debionetwork/polkadot-provider/lib/command/genetic-analyst/genetic-analysis-orders',
  () => ({
    setGeneticAnalysisOrderFulfilled: jest.fn(),
  }),
);

describe('Genetic Analysis ResultReady Handler Event', () => {
  let geneticAnalysisResultReadyHandler: GeneticAnalysisResultReadyHandler;
  let substrateServiceMock: MockType<SubstrateService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        GeneticAnalysisResultReadyHandler,
      ],
    }).compile();

    geneticAnalysisResultReadyHandler = module.get(
      GeneticAnalysisResultReadyHandler,
    );
    substrateServiceMock = module.get(SubstrateService);

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
    const requestData = createMockGeneticAnalysis(
      GeneticAnalysisStatus.ResultReady,
    );
    when(setResultReadySpy)
      .calledWith(
        substrateServiceMock.api,
        substrateServiceMock.pair,
        requestData.toHuman().geneticAnalysisTrackingId,
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
    expect(setResultReadySpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      substrateServiceMock.pair,
      requestData.toHuman().geneticAnalysisTrackingId,
    );
  });
});
