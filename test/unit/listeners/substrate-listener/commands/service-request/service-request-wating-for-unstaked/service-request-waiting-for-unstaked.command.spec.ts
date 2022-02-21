import { RequestStatus } from '../../../../../../../src/common';
import { ServiceRequestWaitingForUnstakedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';
import { ServiceRequest } from '../../../../../../../src/common/polkadot-provider/models/service-request';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';

jest.mock(
  '../../../../../../../src/common/polkadot-provider/models/service-request',
);

describe('Service Request Waiting For Unstaked Command Event', () => {
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
    const MOCK_DATA = createMockRequest(RequestStatus.Processed);

    const _= // eslint-disable-line
      new ServiceRequestWaitingForUnstakedCommand(MOCK_DATA, mockBlockNumber());

    expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
    expect(ServiceRequest).toHaveBeenCalled();
    expect(ServiceRequest).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
  });

  it('should throw error if cannot called toHuman from array param object', () => {
    expect(() => {
      const _= // eslint-disable-line
        new ServiceRequestWaitingForUnstakedCommand(
          [{}, {}],
        mockBlockNumber(),
      );
    }).toThrow();
  });
});
