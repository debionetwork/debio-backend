import { DateTimeProxy } from '../../../../../../../src/common';
import { NotificationService } from '../../../../../../../src/endpoints/notification/notification.service';
import {
  createMockDnaSample,
  dateTimeProxyMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
} from '../../../../../mock';
import { DnaSampleResultReadyCommandHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-testing/dna-sample-result-ready/dna-sample-result-ready.handler';
import { Test, TestingModule } from '@nestjs/testing';
import { DnaSampleResultReadyCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-testing';

describe('DNA Sample Result Ready Handler Event', () => {
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>; // eslint-disable-line
  let dnaSampleResultReadyHandler: MockType<DnaSampleResultReadyCommandHandler>;

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
        DnaSampleResultReadyCommandHandler,
      ],
    }).compile();

    notificationServiceMock = module.get(NotificationService);
    dnaSampleResultReadyHandler = module.get(
      DnaSampleResultReadyCommandHandler,
    );
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Dna Sample Result Handler', () => {
    expect(dnaSampleResultReadyHandler).toBeDefined();
  });

  it('should called notification service insert', async () => {
    // Arrange
    const dnaSampleData = createMockDnaSample();
    const dnaSample = dnaSampleData.toHuman();

    const dnaSampleResultReadyCommand = new DnaSampleResultReadyCommand(
      [dnaSampleData],
      mockBlockNumber(),
    );

    dnaSampleResultReadyHandler.execute(dnaSampleResultReadyCommand);
    expect(notificationServiceMock.insert).toBeCalledTimes(1);
    expect(notificationServiceMock.insert).toBeCalledWith(
      expect.objectContaining({
        role: 'Customer',
        entity_type: 'Genetic Testing Tracking',
        entity: 'Order Fulfilled',
        description: `Your test results for ${dnaSample.orderId} are out. Click here to see your order details.`,
        read: false,
        deleted_at: null,
        from: 'Debio Network',
        to: dnaSample.ownerId,
      }),
    );
  });
});
