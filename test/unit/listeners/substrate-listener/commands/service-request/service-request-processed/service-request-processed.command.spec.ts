import { ServiceRequestProcessedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { ServiceInvoice } from '@debionetwork/polkadot-provider';

jest.mock('@debionetwork/polkadot-provider');

describe('Service Request Processed Command Event', () => {
  const createMockServiceInvoice = () => {
    return [
      {},
      {
        toHuman: jest.fn(() => ({
          requestHash: '',
          orderId: '',
          serviceId: '',
          customerAddress: '',
          sellerAddress: '',
          dnaSampleTrackingId: '',
          testingPrice: '',
          qcPrice: '',
          payAmount: '',
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
    const MOCK_DATA = createMockServiceInvoice();

    const _ = new ServiceRequestProcessedCommand(MOCK_DATA, mockBlockNumber()); // eslint-disable-line

    expect(MOCK_DATA[1].toHuman).toHaveBeenCalled();
    expect(ServiceInvoice).toHaveBeenCalled();
    expect(ServiceInvoice).toHaveBeenCalledWith(MOCK_DATA[1].toHuman());
  });

  it('should throw error', () => {
    expect(() => {
      const _ = new ServiceRequestProcessedCommand([{}, {}], mockBlockNumber()); // eslint-disable-line
    }).toThrow();
  });
});
