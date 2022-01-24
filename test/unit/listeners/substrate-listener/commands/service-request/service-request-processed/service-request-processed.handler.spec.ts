import { Test, TestingModule } from '@nestjs/testing';
import { MockType, substrateServiceMockFactory } from '../../../../../mock';
import { SubstrateService } from '../../../../../../../src/common';
import { ServiceRequestProcessedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-processed/service-request-processed.handler';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { ServiceRequestProcessedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request';
import * as serviceRequestQuery from '../../../../../../../src/common/polkadot-provider/query/service-request';
import * as orderCommand from '../../../../../../../src/common/polkadot-provider/command/orders';
import { when } from 'jest-when';

describe('Service Request Processed Handler Event', () => {
  let serviceRequesProcessedHandler: ServiceRequestProcessedHandler;
  let substrateServiceMock: MockType<SubstrateService>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SubstrateService,
          useFactory: substrateServiceMockFactory,
        },
        ServiceRequestProcessedHandler,
      ],
    }).compile();

    serviceRequesProcessedHandler = module.get(ServiceRequestProcessedHandler);
    substrateServiceMock = module.get(SubstrateService);
  });

  it('ServiceRequestProcessedHandler must defined', () => {
    expect(serviceRequesProcessedHandler).toBeDefined();
  });

  it('should called ServiceRequesProcessedHandler from command bus', async () => {
    const queryServiceInvoiceByIdSpy = jest
      .spyOn(serviceRequestQuery, 'queryServiceInvoiceById')
      .mockImplementation();
    const setOrderPaidSpy = jest
      .spyOn(orderCommand, 'setOrderPaid')
      .mockImplementation();
    const requestData = createMockServiceInvoice();

    const SERVICE_INVOICE_RETURN = {
      orderId: 'string',
    };

    when(queryServiceInvoiceByIdSpy)
      .calledWith(
        substrateServiceMock.api,
        requestData[1].toHuman().requestHash,
      )
      .mockReturnValue(SERVICE_INVOICE_RETURN);

    const serviceRequestProcessedCommand: ServiceRequestProcessedCommand =
      new ServiceRequestProcessedCommand(requestData, mockBlockNumber());
    await serviceRequesProcessedHandler.execute(serviceRequestProcessedCommand);
    expect(queryServiceInvoiceByIdSpy).toHaveBeenCalled();
    expect(queryServiceInvoiceByIdSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      requestData[1].toHuman().requestHash,
    );
    expect(setOrderPaidSpy).toHaveBeenCalled();
    expect(setOrderPaidSpy).toHaveBeenCalledWith(
      substrateServiceMock.api,
      substrateServiceMock.pair,
      SERVICE_INVOICE_RETURN.orderId,
    );
  });
});
