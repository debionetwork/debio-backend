import {
  DateTimeProxy,
  NotificationService,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { GeneticAnalystVerificationStatusCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalyst,
  mockBlockNumber,
  MockType,
  dateTimeProxyMockFactory,
  transactionLoggingServiceMockFactory,
  notificationServiceMockFactory,
} from '../../../../../mock';
import { GeneticAnalystVerificationStatusHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-verification-status/genetic-analyst-verification-status.handler';
import { when } from 'jest-when';

describe('Genetic Analyst Verification Status Handler Event', () => {
  let geneticAnalystVerificationStatusHandler: GeneticAnalystVerificationStatusHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let notificationServiceMock: MockType<NotificationService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>; // eslint-disable-line

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
        GeneticAnalystVerificationStatusHandler,
      ],
    }).compile();

    geneticAnalystVerificationStatusHandler = module.get(
      GeneticAnalystVerificationStatusHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line
    notificationServiceMock = module.get(NotificationService);

    await module.init();
  });

  it('should defined Genetic Analyst Verification Status Handler', () => {
    expect(geneticAnalystVerificationStatusHandler).toBeDefined();
  });

  it('should not called logging Verification Status', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();

    const RESULT_STATUS = true;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 21)
      .mockReturnValue(RESULT_STATUS);

    const GeneticAnalysisOrders: GeneticAnalystVerificationStatusCommand =
      new GeneticAnalystVerificationStatusCommand(
        [geneticAnalyst],
        mockBlockNumber(),
      );

    await geneticAnalystVerificationStatusHandler.execute(
      GeneticAnalysisOrders,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    expect(notificationServiceMock.insert).toBeCalled();
  });

  it('should called logging Verification Status Rejected', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst('Rejected');

    const RESULT_STATUS = false;
    const ACCOUNT_ID = geneticAnalyst.toHuman().accountId;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 21)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalystVerificationStatusCommand: GeneticAnalystVerificationStatusCommand =
      new GeneticAnalystVerificationStatusCommand(
        [geneticAnalyst],
        mockBlockNumber(),
      );

    await geneticAnalystVerificationStatusHandler.execute(
      geneticAnalystVerificationStatusCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        address: ACCOUNT_ID,
        transaction_type: 4,
        transaction_status: 21,
        currency: 'DBIO',
      }),
    );
    expect(notificationServiceMock.insert).toBeCalled();
  });

  it('should called logging Verification Status Verified', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst('Verified');

    const RESULT_STATUS = false;
    const ACCOUNT_ID = geneticAnalyst.toHuman().accountId;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 21)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalystVerificationStatusCommand: GeneticAnalystVerificationStatusCommand =
      new GeneticAnalystVerificationStatusCommand(
        [geneticAnalyst],
        mockBlockNumber(),
      );

    await geneticAnalystVerificationStatusHandler.execute(
      geneticAnalystVerificationStatusCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        address: ACCOUNT_ID,
        transaction_type: 4,
        transaction_status: 20,
        currency: 'DBIO',
      }),
    );
    expect(notificationServiceMock.insert).toBeCalled();
  });

  it('should called logging Verification Status Revoked', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst('Revoked');

    const RESULT_STATUS = false;
    const ACCOUNT_ID = geneticAnalyst.toHuman().accountId;

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 21)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalystVerificationStatusCommand: GeneticAnalystVerificationStatusCommand =
      new GeneticAnalystVerificationStatusCommand(
        [geneticAnalyst],
        mockBlockNumber(),
      );

    await geneticAnalystVerificationStatusHandler.execute(
      geneticAnalystVerificationStatusCommand,
    );
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        address: ACCOUNT_ID,
        transaction_type: 4,
        transaction_status: 22,
        currency: 'DBIO',
      }),
    );
    expect(notificationServiceMock.insert).toBeCalled();
  });
});
