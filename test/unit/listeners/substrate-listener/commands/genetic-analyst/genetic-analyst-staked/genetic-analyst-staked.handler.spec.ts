import {
  DateTimeProxy,
  TransactionLoggingService,
} from '../../../../../../../src/common';
import { GeneticAnalystStakedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockGeneticAnalyst,
  mockBlockNumber,
  MockType,
  transactionLoggingServiceMockFactory,
  dateTimeProxyMockFactory,
} from '../../../../../mock';
import { GeneticAnalystStakedHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analysts/genetic-analyst-staked/genetic-analyst-staked.handler';
import { when } from 'jest-when';
import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';

describe('Genetic Analyst Staked Handler Event', () => {
  let geneticAnalystStakedHandler: GeneticAnalystStakedHandler;
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
        GeneticAnalystStakedHandler,
      ],
    }).compile();

    geneticAnalystStakedHandler = module.get(GeneticAnalystStakedHandler);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line

    await module.init();
  });

  it('should defined Genetic Analyst Staked Handler', () => {
    expect(geneticAnalystStakedHandler).toBeDefined();
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

    const geneticAnalystOrders: GeneticAnalystStakedCommand =
      new GeneticAnalystStakedCommand([geneticAnalyst], mockBlockNumber());

    await geneticAnalystStakedHandler.execute(geneticAnalystOrders);
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

    const geneticAnalystStakedCommand: GeneticAnalystStakedCommand =
      new GeneticAnalystStakedCommand([geneticAnalyst], mockBlockNumber());

    await geneticAnalystStakedHandler.execute(geneticAnalystStakedCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    await transactionLoggingServiceMock.create();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
