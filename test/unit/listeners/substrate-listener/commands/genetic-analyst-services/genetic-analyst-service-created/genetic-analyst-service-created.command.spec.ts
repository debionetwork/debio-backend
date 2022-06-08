import { GeneticAnalystService } from '@debionetwork/polkadot-provider';
import { GeneticAnalystServiceCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analyst-services/genetic-analyst-service-created/genetic-analyst-service-created.command';
import {
  createMockGeneticAnalystService,
  mockBlockNumber,
} from '../../../../../mock';

jest.mock('@debionetwork/polkadot-provider');

describe('Genetic Analyst Service Cretaed Command Event', () => {
  it('should called model data and toHuman', () => {
    const geneticAnalystServiceData = createMockGeneticAnalystService();

    const _ = new GeneticAnalystServiceCreatedCommand( // eslint-disable-line
      [geneticAnalystServiceData],
      mockBlockNumber(),
    );
    expect(GeneticAnalystService).toHaveBeenCalled();
    expect(GeneticAnalystService).toHaveBeenCalledWith(
      geneticAnalystServiceData.toHuman(),
    );
    expect(geneticAnalystServiceData.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new GeneticAnalystServiceCreatedCommand( // eslint-disable-line
        [{}],
        mockBlockNumber(),
      );
    }).toThrowError();
  });
});
