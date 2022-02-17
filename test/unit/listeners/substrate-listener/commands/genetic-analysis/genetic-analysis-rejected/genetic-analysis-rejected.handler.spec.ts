import {
  GeneticAnalysisStatus,
  SubstrateService,
} from '../../../../../../../src/common';
import { GeneticAnalysisRejectedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalysis,
  mockBlockNumber,
  MockType,
  substrateServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalysisRejectedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis/genetic-analysis-rejected/genetic-analysis-rejected.handler';
import * as geneticAnalysisOrderCommand from '../../../../../../../src/common/polkadot-provider/command/genetic-analysis-order';
import { when } from 'jest-when';

jest.mock('../../../../../../../src/common/polkadot-provider/command/genetic-analysis-order', () => ({
  setGeneticAnalysisOrderRefunded: jest.fn(),
}));

describe('Genetic Analysis Rejected Handler Event', () => {
  const genetic_analysis = createMockGeneticAnalysis(GeneticAnalysisStatus.Rejected);

  let geneticAnalysisRejectedHandler: GeneticAnalysisRejectedHandler;
  let substrateServiceMock: MockType<SubstrateService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        GeneticAnalysisRejectedHandler,
      ],
    }).compile();

    geneticAnalysisRejectedHandler = module.get(GeneticAnalysisRejectedHandler);
    substrateServiceMock = module.get(SubstrateService);

    await module.init();
  });

  it('should defined GA Rejected Handler', () => {
    expect(geneticAnalysisRejectedHandler).toBeDefined();
  });

  it('should called Genetic Analysis Rejected from command bus', async () => {
    // Arrange
    const genetic_analysis = createMockGeneticAnalysis(GeneticAnalysisStatus.Rejected);
    const setRejectedSpy = jest
      .spyOn(geneticAnalysisOrderCommand, 'setGeneticAnalysisOrderRefunded')
      .mockImplementation();
    const requestData = createMockGeneticAnalysis(GeneticAnalysisStatus.Rejected);
    when(setRejectedSpy)
      .calledWith(
        substrateServiceMock.api,
        substrateServiceMock.pair,
        requestData.toHuman().geneticAnalysisTrackingId,
      )
      .mockReturnValue(genetic_analysis)

    const geneticAnalysisRejectedCommand: GeneticAnalysisRejectedCommand =
      new GeneticAnalysisRejectedCommand([genetic_analysis], mockBlockNumber());
    await geneticAnalysisRejectedHandler.execute(geneticAnalysisRejectedCommand);

    expect(setRejectedSpy).toHaveBeenCalled();
    expect(setRejectedSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      substrateServiceMock.pair,
      requestData.toHuman().geneticAnalysisTrackingId,
    );
  });
});
