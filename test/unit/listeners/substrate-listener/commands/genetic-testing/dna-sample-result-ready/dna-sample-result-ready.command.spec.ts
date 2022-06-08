import { DnaSample } from '@debionetwork/polkadot-provider/lib/models/labs/genetic-testing/dna-sample';
import { DnaSampleResultReadyCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-testing';
import { createMockDnaSample, mockBlockNumber } from '../../../../../mock';
jest.mock(
  '@debionetwork/polkadot-provider/lib/models/labs/genetic-testing/dna-sample',
);
describe('DNA Sample Result Ready Command', () => {
  it('should called model data and toHuman', () => {
    const dnaSample = createMockDnaSample();

    const _ = new DnaSampleResultReadyCommand([dnaSample], mockBlockNumber()); // eslint-disable-line
    expect(DnaSample).toHaveBeenCalled();
    expect(DnaSample).toHaveBeenCalledWith(dnaSample.toHuman());
    expect(dnaSample.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new DnaSampleResultReadyCommand([{}], mockBlockNumber()); // eslint-disable-line
    }).toThrowError();
  });
});
