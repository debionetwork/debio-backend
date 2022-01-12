import { TransactionController } from "../../../../src/endpoints/transaction/transaction.controller"
import { MockType } from "test/unit/mock"
import { TransactionService } from "../../../../src/endpoints/transaction/transaction.service";
import { Test, TestingModule } from "@nestjs/testing";
import { TransactionLoggingService } from "src/common";
import { TransactionRequest } from "../../../../src/common/modules/transaction-logging/models/transaction-request.entity";

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
    const EXPECTED_PARAM = new TransactionRequest();
    EXPECTED_PARAM.id = BigInt(0);
    EXPECTED_PARAM.address = "string";
    EXPECTED_PARAM.amount = 0;
    EXPECTED_PARAM.created_at = new Date();
    EXPECTED_PARAM.currency = "string";
    EXPECTED_PARAM.parent_id = BigInt(0);
    EXPECTED_PARAM.ref_number = "string";
    EXPECTED_PARAM.transaction_type = 0;
    EXPECTED_PARAM.transaction_status = 0;
    EXPECTED_PARAM.transaction_hash = "string";

    transactionLoggingService.getLoggingByOrderId.mockReturnValue(EXPECTED_PARAM);
  });

  it('should get transaction hash from elasticsearch', () => {
    // Assert
    
  });

  it('should get transaction hash from postgresql', () => {
    // Assert
    
  });
})