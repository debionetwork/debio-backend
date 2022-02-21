import { GeneticAnalysisOrderStatus } from '../../../../../../../src/common';
import { GeneticAnalysisOrderPaidCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysis-order';
import {
  createMockGeneticAnalysisOrder,
  mockBlockNumber,
} from '../../../../../mock';
import { GeneticAnalystOrder } from '../../../../../../../src/common/polkadot-provider/models/genetic-analysis-orders';

jest.mock(
  '../../../../../../../src/common/polkadot-provider/models/genetic-analysis-orders',
);

describe('Genetic Analysis Order Paid Command Event', () => {
  it('should called model data and toHuman', () => {
    const GA_ORDER_RESPONSE = createMockGeneticAnalysisOrder(
      GeneticAnalysisOrderStatus.Unpaid,
    );

    const _= // eslint-disable-line
      new GeneticAnalysisOrderPaidCommand([GA_ORDER_RESPONSE], mockBlockNumber());
    expect(GeneticAnalystOrder).toHaveBeenCalled();
    expect(GeneticAnalystOrder).toHaveBeenCalledWith(
      GA_ORDER_RESPONSE.toHuman(),
    );
    expect(GA_ORDER_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _= // eslint-disable-line
        new GeneticAnalysisOrderPaidCommand([{}], mockBlockNumber());
    }).toThrowError();
  });
});
