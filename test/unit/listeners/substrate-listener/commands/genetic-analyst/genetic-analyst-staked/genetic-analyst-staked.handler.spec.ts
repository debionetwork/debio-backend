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

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
      .calledWith(geneticAnalyst.toHuman().accountId, 19)
      .mockReturnValue(RESULT_STATUS);

    const GeneticAnalysisOrders: GeneticAnalystStakedCommand =
      new GeneticAnalystStakedCommand([geneticAnalyst], mockBlockNumber());

    await geneticAnalystStakedHandler.execute(GeneticAnalysisOrders);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
  });

  it('should called logging service create', async () => {
    // Arrange
    const geneticAnalyst = createMockGeneticAnalyst();

    when(transactionLoggingServiceMock.getLoggingByHashAndStatus).calledWith(
      geneticAnalyst.toHuman().accountId,
      19,
    );

    const GeneticAnalysisOrderPaidCommand: GeneticAnalystStakedCommand =
      new GeneticAnalystStakedCommand([geneticAnalyst], mockBlockNumber());

    await geneticAnalystStakedHandler.execute(GeneticAnalysisOrderPaidCommand);
    expect(
      transactionLoggingServiceMock.getLoggingByHashAndStatus,
    ).toHaveBeenCalled();
    await transactionLoggingServiceMock.create();
    expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
  });
});
