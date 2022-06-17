import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { NotificationService } from '../../../../../../../src/common/modules/notification/notification.service';
import { LabRegisteredCommand } from '../../../../../../../src/listeners/substrate-listener/commands/labs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockLab,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
  notificationServiceMockFactory,
  dateTimeProxyMockFactory,
} from '../../../../../mock';
import { LabRegisteredHandler } from '../../../../../../../src/listeners/substrate-listener/commands/labs/registered/lab-registered.handler';
import { when } from 'jest-when';

describe('Lab Registered Handler Event', () => {
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>; // eslint-disable-line
  let labRegisteredHandler: LabRegisteredHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        LabRegisteredHandler,
      ],
    }).compile();

    labRegisteredHandler = module.get(LabRegisteredHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    notificationServiceMock = module.get(NotificationService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Lab Registered Handler', () => {
    expect(labRegisteredHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    const lab = createMockLab();

    const RESULT_STATUS = true;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(lab.toHuman().accountId, 28)
      .mockReturnValue(RESULT_STATUS);

    const registeredLab: LabRegisteredCommand = new LabRegisteredCommand(
      [lab],
      mockBlockNumber(),
    );

    await labRegisteredHandler.execute(registeredLab);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const lab = createMockLab();

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus).calledWith(
      lab.toHuman().accountId,
      28,
    );

    const labRegisteredCommand: LabRegisteredCommand = new LabRegisteredCommand(
      [lab],
      mockBlockNumber(),
    );

    await labRegisteredHandler.execute(labRegisteredCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    await transactionLoggingServiceMock.create();
    await notificationServiceMock.insert();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalled();
  });
});
