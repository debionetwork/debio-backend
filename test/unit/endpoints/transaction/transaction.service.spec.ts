import { TransactionLoggingService } from "../../../../src/common/modules/transaction-logging/transaction-logging.service";
import { TransactionService } from "../../../../src/endpoints/transaction/transaction.service";
import { MockType } from "test/unit/mock";
import { Test, TestingModule } from "@nestjs/testing";

describe('Transaction Service Unit Test', () => {
  let transactionService: TransactionService;
  let transactionLoggingService: MockType<TransactionLoggingService>;

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
    transactionLoggingService = module.get(TransactionLoggingService);
  });
});