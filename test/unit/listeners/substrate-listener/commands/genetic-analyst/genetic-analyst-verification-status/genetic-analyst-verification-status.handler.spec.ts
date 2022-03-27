import {
  DateTimeProxy,
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
} from '../../../../../mock';
import { GeneticAnalystVerificationStatusHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-verification-status/genetic-analyst-verification-status.handler';
import { when } from 'jest-when';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

describe('Genetic Analyst Verification Status Handler Event', () => {
  let geneticAnalystVerificationStatusHandler: GeneticAnalystVerificationStatusHandler;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>; // eslint-disable-line

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
        GeneticAnalystVerificationStatusHandler,
      ],
    }).compile();

    geneticAnalystVerificationStatusHandler = module.get(
      GeneticAnalystVerificationStatusHandler,
    );
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Genetic Analyst Verification Status Handler', () => {
    expect(geneticAnalystVerificationStatusHandler).toBeDefined();
  });

  it('should not called logging Verification Status', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();

    const RESULT_STATUS = true;
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(0);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 14)
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
  });

  it('should called logging Verification Status Rejected', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();
    geneticAnalyst.toHuman().verificationStatus = 'Rejected';

    const RESULT_STATUS = { id: 1 };
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(1);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 14)
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
  });

  it('should called logging Verification Status Verified', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();
    geneticAnalyst.toHuman().verificationStatus = 'Verified';

    const RESULT_STATUS = { id: 1 };
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(1);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 14)
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
  });

  it('should called logging Verification Status Revoked', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();
    geneticAnalyst.toHuman().verificationStatus = 'Revoked';

    const RESULT_STATUS = { id: 1 };
    const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
    RESULT_TRANSACTION.id = BigInt(0);
    RESULT_TRANSACTION.address = 'string';
    RESULT_TRANSACTION.amount = 0;
    RESULT_TRANSACTION.created_at = new Date();
    RESULT_TRANSACTION.currency = 'string';
    RESULT_TRANSACTION.parent_id = BigInt(1);
    RESULT_TRANSACTION.ref_number = 'string';
    RESULT_TRANSACTION.transaction_type = 0;
    RESULT_TRANSACTION.transaction_status = 0;
    RESULT_TRANSACTION.transaction_hash = 'string';

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 14)
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
  });
});
