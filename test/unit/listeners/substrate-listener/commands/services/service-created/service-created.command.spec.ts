import { ServiceCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/services';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import {
  Service,
  ServiceFlow,
  ServiceInfo,
} from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Serive Created Command Event', () => {
  const createMockService = (
    serviceInfo: ServiceInfo,
    serviceFlow: ServiceFlow,
  ) => {
    return [
      {
        toHuman: jest.fn(() => ({
          id: 'string',
          owner_id: 'string',
          currency: 'string',
          price: 'string',
          qc_price: 'string',
          info: serviceInfo,
          service_flow: serviceFlow,
        })),
      },
      {},
    ];
  };

  function mockBlockNumber(): BlockMetaData {
    return {
      blockHash: 'string',
      blockNumber: 1,
    };
  }

  it('should called Model and toHuman', () => {
    const serviceInfo = {
      name: 'string',
      category: 'string',
      description: 'string',
      pricesByCurrency: [],
      expectedDuration: {
        duration: 'XX',
        durationType: 'XX',
      },
      testResultSample: 'string',
      longDescription: 'string',
      image: 'string',
      dnaCollectionProcess: 'string',
      price: 'string',
    };

    const MOCK_DATA = createMockService(serviceInfo, ServiceFlow.RequestTest);

    const _ = new ServiceCreatedCommand(MOCK_DATA, mockBlockNumber()); // eslint-disable-line

    expect(MOCK_DATA[0].toHuman).toHaveBeenCalled();
    expect(Service).toHaveBeenCalled();
    expect(Service).toHaveBeenLastCalledWith(MOCK_DATA[0].toHuman());
  });

  it('should throw error', () => {
    expect(() => {
      const _ = new ServiceCreatedCommand([{}, {}], mockBlockNumber()); // eslint-disable-line
    }).toThrow();
  });
});
