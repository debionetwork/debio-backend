import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { LabStakeSuccessfulCommand } from '../../../../../../../src/listeners/substrate-listener/commands/labs';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockLab,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
  dateTimeProxyMockFactory,
} from '../../../../../mock';
import { LabStakeSuccessfullHandler } from '../../../../../../../src/listeners/substrate-listener/commands/labs/stake-successfull/stake-successful.handler';
import { when } from 'jest-when';

describe('Lab Staked Successful Handler Event', () => {
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>; // eslint-disable-line
  let labStakeSuccessfullHandler: LabStakeSuccessfullHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        LabStakeSuccessfullHandler,
      ],
    }).compile();

    labStakeSuccessfullHandler = module.get(LabStakeSuccessfullHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Lab Staked Successful Handler', () => {
    expect(labStakeSuccessfullHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
    // Arrange
    jest
      .useRealTimers()
      .setSystemTime(new Date('Thu Jan 24 2022 07:02:00 GMT+0700').getTime());
    const lab = createMockLab();

    const RESULT_STATUS = {
      created_at: new Date('Thu Jan 24 2022 07:00:00 GMT+0700').getTime(),
    };

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(lab.toHuman().accountId, 26)
      .mockReturnValue(RESULT_STATUS);

    const stakedLab: LabStakeSuccessfulCommand = new LabStakeSuccessfulCommand(
      [lab],
      mockBlockNumber(),
    );

    await labStakeSuccessfullHandler.execute(stakedLab);
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
      26,
    );

    const labStakedSuccessfulCommand: LabStakeSuccessfulCommand =
      new LabStakeSuccessfulCommand([lab], mockBlockNumber());

    await labStakeSuccessfullHandler.execute(labStakedSuccessfulCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    await transactionLoggingServiceMock.create();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
