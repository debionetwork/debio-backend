import { TransactionController } from "../../../../src/endpoints/transaction/transaction.controller"
import { MockType } from "test/unit/mock"
import { TransactionService } from "../../../../src/endpoints/transaction/transaction.service";
import { Test, TestingModule } from "@nestjs/testing";
import { TransactionLoggingService } from "src/common";

describe('Transaction Controller Unit Test', () => {
  let transactionController: MockType<TransactionController>;
  let transactionService: MockType<TransactionService>;
  let transactionLoggingService: MockType<TransactionLoggingService>;

  const transactionServiceMockFactory: () => MockType<TransactionService> = jest.fn(() => ({
    submitTransactionHash: jest.fn(),
    getTransactionHashFromES: jest.fn(),
    getTransactionHashFromPG: jest.fn()
  }));

  const transactionLoggingServiceMockFactory: () => MockType<TransactionLoggingService> = jest.fn(() => ({
    updateHash: jest.fn(),
    getLoggingByOrderId: jest.fn()
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionController,
        { provide: TransactionService, useFactory: transactionServiceMockFactory },
        { provide: TransactionLoggingService, useFactory: transactionLoggingServiceMockFactory },
      ],
    }).compile();

    transactionController = module.get(TransactionController);
    transactionService = module.get(TransactionService);
    transactionLoggingService = module.get(TransactionLoggingService);
  });

  it('should be defined', () => {
    // Assert
    expect(transactionController).toBeDefined();
  });

  it('should update transaction', () => {
    // Assert
    
  });

  it('should get transaction hash from elasticsearch', () => {
    // Assert
    
  });

  it('should get transaction hash from postgresql', () => {
    // Assert
    
  });
})