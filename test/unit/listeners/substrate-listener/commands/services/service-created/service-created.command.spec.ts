import { ServiceCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/services';
import { ServiceFlow, ServiceInfo } from '../../../../../../../src/common';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { Service } from '../../../../../../../src/common/polkadot-provider/models/services';

jest.mock('../../../../../../../src/common/polkadot-provider/models/services');

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

    const _ = // eslint-disable-line
      new ServiceCreatedCommand(MOCK_DATA, mockBlockNumber());

    expect(MOCK_DATA[0].toHuman).toHaveBeenCalled();
    expect(Service).toHaveBeenCalled();
    expect(Service).toHaveBeenLastCalledWith(MOCK_DATA[0].toHuman());
  });

  it('should throw error', () => {
    expect(() => {
        const _ = // eslint-disable-line
          new ServiceCreatedCommand([{}, {}], mockBlockNumber());
    }).toThrow();
  });
});
