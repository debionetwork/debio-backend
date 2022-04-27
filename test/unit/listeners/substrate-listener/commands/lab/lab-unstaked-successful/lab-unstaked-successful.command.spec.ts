import { LabUnstakedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/labs';
import { createMockLab, mockBlockNumber } from '../../../../../mock';
import { Lab } from '@debionetwork/polkadot-provider';
jest.mock('@debionetwork/polkadot-provider');

describe('Lab Unstake Successful Command Event', () => {
  it('should called model data and toHuman', () => {
    const lab = createMockLab();

    const _ = new LabUnstakedCommand([lab], mockBlockNumber()); // eslint-disable-line
    expect(Lab).toHaveBeenCalled();
    expect(Lab).toHaveBeenCalledWith(lab.toHuman());
    expect(lab.toHuman).toHaveBeenCalled();
  });

  it('should throw error if toHuman not defined', () => {
    expect(() => {
      const _ = new LabUnstakedCommand([{}], mockBlockNumber()); // eslint-disable-line
    }).toThrowError();
  });
});
