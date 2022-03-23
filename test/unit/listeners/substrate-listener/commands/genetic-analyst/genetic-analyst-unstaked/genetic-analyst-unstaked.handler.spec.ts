import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { GeneticAnalystUnstakedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalyst,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
  dateTimeProxyMockFactory,
} from '../../../../../mock';
import { GeneticAnalystUnstakedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-unstake/genetic-analyst-unstaked.handler';
import { when } from 'jest-when';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

describe('Genetic Analyst Staked Handler Event', () => {
  let geneticAnalystUnstakedHandler: GeneticAnalystUnstakedHandler;
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
        GeneticAnalystUnstakedHandler,
      ],
    }).compile();

    geneticAnalystUnstakedHandler = module.get(GeneticAnalystUnstakedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Genetic Analyst Unstaked Handler', () => {
    expect(geneticAnalystUnstakedHandler).toBeDefined();
  });

  it('should not called logging service create', async () => {
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
      .calledWith(geneticAnalyst.toHuman().accountId, 19)
      .mockReturnValue(RESULT_STATUS);

    const geneticAnalystOrders: GeneticAnalystUnstakedCommand =
      new GeneticAnalystUnstakedCommand([geneticAnalyst], mockBlockNumber());

    await geneticAnalystUnstakedHandler.execute(geneticAnalystOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();

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

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus).calledWith(
      geneticAnalyst.toHuman().accountId,
      19,
    );

    const geneticAnalystUnstakedCommand: GeneticAnalystUnstakedCommand =
      new GeneticAnalystUnstakedCommand([geneticAnalyst], mockBlockNumber());

    await geneticAnalystUnstakedHandler.execute(geneticAnalystUnstakedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    await transactionLoggingServiceMock.create();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
