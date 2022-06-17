import { Test, TestingModule } from '@nestjs/testing';
import {
  dateTimeProxyMockFactory,
  MockType,
  notificationServiceMockFactory,
} from '../../../../../mock';
import { BlockMetaData } from '../../../../../../../src/listeners/substrate-listener/models/block-metadata.event-model';
import { ServiceRequestStakingAmountRefundedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-staking-amount-refunded/service-request-staking-amount-refunded.handler';
import { NotificationService } from '../../../../../../../src/common/modules/notification/notification.service';
import { ServiceRequestStakingAmountRefundedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/service-request/service-request-staking-amount-refunded/service-request-staking-amount-refunded.command';
import { DateTimeProxy } from '../../../../../../../src/common';

describe('Service Request Staking Amount Refunded Handler Event', () => {
  let serviceRequesStakingAmountRefundedHandler: ServiceRequestStakingAmountRefundedHandler;
  let notificationServiceMock: MockType<NotificationService>;

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
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        ServiceRequestStakingAmountRefundedHandler,
      ],
    }).compile();

    serviceRequesStakingAmountRefundedHandler = module.get(
      ServiceRequestStakingAmountRefundedHandler,
    );
    notificationServiceMock = module.get(NotificationService);
  });

  it('ServiceRequestStakingAmountRefundedHandler must defined', () => {
    expect(serviceRequesStakingAmountRefundedHandler).toBeDefined();
  });

  it('should called ServiceRequestStakingAmountRefundedHandler from command bus', async () => {
    const REQUESTER_ID = 'XX';
    const REQUEST_ID = 'XX';
    const requestData = new Array<string>(REQUESTER_ID, REQUEST_ID);

    const serviceRequestStakingAmountRefundedCommand: ServiceRequestStakingAmountRefundedCommand =
      new ServiceRequestStakingAmountRefundedCommand(
        requestData,
        mockBlockNumber(),
      );
    await serviceRequesStakingAmountRefundedHandler.execute(
      serviceRequestStakingAmountRefundedCommand,
    );
    expect(notificationServiceMock.insert).toBeCalledTimes(1);
    expect(notificationServiceMock.insert).toBeCalledWith(
      expect.objectContaining({
        role: 'Customer',
        entity_type: 'Request Service Staking',
        entity: 'Requested Service Unstaked',
        description: `Your staked amount from staking ID ${REQUEST_ID} has been refunded, kindly check your balance.`,
        from: 'Debio Network',
        to: REQUESTER_ID,
      }),
    );
  });
});
