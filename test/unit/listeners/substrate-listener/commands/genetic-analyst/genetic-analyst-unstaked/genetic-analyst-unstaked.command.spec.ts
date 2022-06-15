import { GeneticAnalystStakedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts';
import { createMockGeneticAnalyst, mockBlockNumber } from '../../../../../mock';
import { GeneticAnalyst } from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Genetic Analyst Staked Command Event', () => {
  it('should called model data and toHuman', () => {
    const geneticAnalyst = createMockGeneticAnalyst();

    const _ = new GeneticAnalystStakedCommand( // eslint-disable-line
      [geneticAnalyst],
      mockBlockNumber(),
    );
    expect(GeneticAnalyst).toHaveBeenCalled();
    expect(GeneticAnalyst).toHaveBeenCalledWith(geneticAnalyst.toHuman());
    expect(geneticAnalyst.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new GeneticAnalystStakedCommand([{}], mockBlockNumber()); // eslint-disable-line
    }).toThrowError();
  });
});
