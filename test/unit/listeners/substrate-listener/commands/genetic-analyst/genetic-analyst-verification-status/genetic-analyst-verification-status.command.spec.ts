import { GeneticAnalystVerificationStatusCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts';
import { createMockGeneticAnalyst, mockBlockNumber } from '../../../../../mock';
import { GeneticAnalyst } from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Genetic Analyst Verification Status Command Event', () => {
  it('should called model data and toHuman', () => {
    const GA_RESPONSE = createMockGeneticAnalyst();

    const _ = new GeneticAnalystVerificationStatusCommand( // eslint-disable-line
      [GA_RESPONSE],
      mockBlockNumber(),
    );
    expect(GeneticAnalyst).toHaveBeenCalled();
    expect(GeneticAnalyst).toHaveBeenCalledWith(GA_RESPONSE.toHuman());
    expect(GA_RESPONSE.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new GeneticAnalystVerificationStatusCommand( // eslint-disable-line
        [{}],
        mockBlockNumber(),
      );
    }).toThrowError();
  });
});
