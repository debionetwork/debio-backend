import { ServiceRequestClaimedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { ServiceRequest, RequestStatus } from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Service Request Claimed Command Event', () => {
  const createMockRequest = (requestStatus: RequestStatus) => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          hash_: 'string',
          requesterAddress: 'string',
          labAddress: 'string',
          country: 'XX',
          region: 'XX',
          city: 'XX',
          serviceCategory: 'Test',
          stakingAmount: '1000000000000',
          status: requestStatus,
          createdAt: '1',
          updatedAt: '1',
          unstakedAt: '1',
        })),
      },
    ];
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: 'string',
      blockNumber: 1,
    };
  }

  it('should called Model and toHuman()', () => {
    const MOCK_DATA = createMockRequest(RequestStatus.Claimed);

    const _ = new ServiceRequestClaimedCommand(MOCK_DATA, mockBlockNumber()); // eslint-disable-line

    expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
    expect(ServiceRequest).toHaveBeenCalled();
    expect(ServiceRequest).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
  });

  it('should throw error', () => {
    expect(() => {
      const _ = new ServiceRequestClaimedCommand([{}, {}], mockBlockNumber()); // eslint-disable-line
    }).toThrow();
  });
});
