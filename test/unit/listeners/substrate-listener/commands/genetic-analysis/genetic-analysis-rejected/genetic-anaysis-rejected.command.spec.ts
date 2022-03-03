import { GeneticAnalysisStatus } from '../../../../../../../src/common';
import { GeneticAnalysisRejectedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis';
import {
  createMockGeneticAnalysis,
  mockBlockNumber,
} from '../../../../../mock';
import { GeneticAnalysis } from '../../../../../../../src/common/polkadot-provider/models/genetic-analysts/genetic-analysis';

jest.mock(
  '../../../../../../../src/common/polkadot-provider/models/genetic-analysis',
);

describe('Genetic Analysis Rejected Command Event', () => {
  it('should called model data and toHuman', () => {
    const GA_ORDER_RESPONSE = createMockGeneticAnalysis(
      GeneticAnalysisStatus.Rejected,
    );

    const _= // eslint-disable-line
      new GeneticAnalysisRejectedCommand([GA_ORDER_RESPONSE], mockBlockNumber());
    expect(GeneticAnalysis).toHaveBeenCalled();
    expect(GeneticAnalysis).toHaveBeenCalledWith(GA_ORDER_RESPONSE.toHuman());
    expect(GA_ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _= // eslint-disable-line
        new GeneticAnalysisRejectedCommand([{}], mockBlockNumber());
    }).toThrowError();
  });
});
