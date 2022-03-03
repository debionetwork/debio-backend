import { GeneticAnalysisOrderRefundedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
import {
  createMockGeneticAnalysisOrder,
  mockBlockNumber,
} from '../../../../../mock';
import { GeneticAnalystOrder, GeneticAnalysisOrderStatus } from '@debionetwork/polkadot-provider';

jest.mock(
  '@debionetwork/polkadot-provider',
);

describe('Genetic Analysis Order Refunded Command Event', () => {
  it('should called model data and toHuman', () => {
    const GA_ORDER_RESPONSE = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Refunded,
    );

    const _= // eslint-disable-line
      new GeneticAnalysisOrderRefundedCommand([GA_ORDER_RESPONSE], mockBlockNumber());
    expect(GeneticAnalystOrder).toHaveBeenCalled();
    expect(GeneticAnalystOrder).toHaveBeenCalledWith(
      GA_ORDER_RESPONSE.toHuman(),
    );
    expect(GA_ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _= // eslint-disable-line
        new GeneticAnalysisOrderRefundedCommand([{}], mockBlockNumber());
    }).toThrowError();
  });
});
