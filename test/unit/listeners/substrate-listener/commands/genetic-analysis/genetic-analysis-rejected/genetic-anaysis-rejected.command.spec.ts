import { GeneticAnalysisRejectedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis';
import {
  createMockGeneticAnalysis,
  mockBlockNumber,
} from '../../../../../mock';
import {
  GeneticAnalysis,
  GeneticAnalysisStatus,
} from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Genetic Analysis Rejected Command Event', () => {
  it('should called model data and toHuman', () => {
    const GA_ORDER_RESPONSE = createMockGeneticAnalysis(
      GeneticAnalysisStatus.Rejected,
    );

    const _ = new GeneticAnalysisRejectedCommand( // eslint-disable-line
      [GA_ORDER_RESPONSE],
      mockBlockNumber(),
    );
    expect(GeneticAnalysis).toHaveBeenCalled();
    expect(GeneticAnalysis).toHaveBeenCalledWith(GA_ORDER_RESPONSE.toHuman());
    expect(GA_ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new GeneticAnalysisRejectedCommand([{}], mockBlockNumber()); // eslint-disable-line
    }).toThrowError();
  });
});
