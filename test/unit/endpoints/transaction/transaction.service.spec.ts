import { TransactionLoggingService } from "../../../../src/common/modules/transaction-logging/transaction-logging.service";
import { TransactionService } from "../../../../src/endpoints/transaction/transaction.service";
import { MockType } from "test/unit/mock";
import { Test, TestingModule } from "@nestjs/testing";
import { when } from 'jest-when';

describe('Transaction Service Unit Test', () => {
  let transactionService: TransactionService;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;

  const transactionLoggingServiceMockFactory: () => MockType<TransactionLoggingService> = jest.fn(() => ({
    updateHash: jest.fn(),
    getLoggingByOrderId: jest.fn()
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
      ],
    }).compile();

    transactionService = module.get(TransactionService);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
  });

  it('should be defined', () => {
    // Assert
    expect(transactionService).toBeDefined();
  });

  it('should submit transaction hash to transaction logging', () => {
    when(transactionLoggingServiceMock.getLoggingByOrderId).calledWith()
  });

  it('should get transaction hash from elasticsearch', () => {

  });

  it('should get transaction hash from postgresql', () => {

  });
});