import { GeneticAnalysisResultReadyCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis';
import {
  createMockGeneticAnalysis,
  mockBlockNumber,
} from '../../../../../mock';
import {
  GeneticAnalysis,
  GeneticAnalysisStatus,
} from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Genetic Analysis Result ready Command Event', () => {
  it('should called model data and toHuman', () => {
    const GA_ORDER_RESPONSE = createMockGeneticAnalysis(
      GeneticAnalysisStatus.ResultReady,
    );

    const _ = new GeneticAnalysisResultReadyCommand( // eslint-disable-line
      [GA_ORDER_RESPONSE],
      mockBlockNumber(),
    );
    expect(GeneticAnalysis).toHaveBeenCalled();
    expect(GeneticAnalysis).toHaveBeenCalledWith(GA_ORDER_RESPONSE.toHuman());
    expect(GA_ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new GeneticAnalysisResultReadyCommand([{}], mockBlockNumber()); // eslint-disable-line
    }).toThrowError();
  });
});
