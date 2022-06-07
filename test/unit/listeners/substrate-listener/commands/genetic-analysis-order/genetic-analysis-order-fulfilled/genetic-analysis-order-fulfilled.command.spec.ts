import { GeneticAnalysisOrderFulfilledCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
import {
  createMockGeneticAnalysisOrder,
  mockBlockNumber,
} from '../../../../../mock';
import {
  GeneticAnalysisOrder,
  GeneticAnalysisOrderStatus,
} from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Genetic Analysis Order Fulfilled Command Event', () => {
  it('should called model data and toHuman', () => {
    const GA_ORDER_RESPONSE = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Fulfilled,
    );

    const _ = new GeneticAnalysisOrderFulfilledCommand( // eslint-disable-line
      [GA_ORDER_RESPONSE],
      mockBlockNumber(),
    );
    expect(GeneticAnalysisOrder).toHaveBeenCalled();
    expect(GeneticAnalysisOrder).toHaveBeenCalledWith(
      GA_ORDER_RESPONSE.toHuman(),
    );
    expect(GA_ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new GeneticAnalysisOrderFulfilledCommand( // eslint-disable-line
        [{}],
        mockBlockNumber(),
      );
    }).toThrowError();
  });
});
