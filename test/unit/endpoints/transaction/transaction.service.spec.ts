import { TransactionLoggingService } from "../../../../src/common/modules/transaction-logging/transaction-logging.service";
import { TransactionService } from "../../../../src/endpoints/transaction/transaction.service";
import { elasticsearchServiceMockFactory, MockType } from "../../mock";
import { Test, TestingModule } from "@nestjs/testing";
import { when } from 'jest-when';
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { TransactionRequest } from "../../../../src/common/modules/transaction-logging/models/transaction-request.entity";

describe('Transaction Service Unit Test', () => {
  let transactionService: TransactionService;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;

  const createSearchObject = (order_id: string) => {
    return {
      index: 'orders',
      body: {
        query: {
          match: { _id: order_id }
        }
      }
    };
  };

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
        { provide: ElasticsearchService, useFactory: elasticsearchServiceMockFactory },
      ],
    }).compile();

    transactionService = module.get(TransactionService);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    // Assert
    expect(transactionService).toBeDefined();
  });

  it('should submit transaction hash to transaction logging', async () => {
    // Arrange
    const ORDER_ID = 'string';
    const TRANSACTION_HASH = 'string';
    
    const EXPECTED_VALUE = new TransactionRequest();
    EXPECTED_VALUE.id = BigInt(0);
    EXPECTED_VALUE.address = "string";
    EXPECTED_VALUE.amount = 0;
    EXPECTED_VALUE.created_at = new Date();
    EXPECTED_VALUE.currency = "string";
    EXPECTED_VALUE.parent_id = BigInt(0);
    EXPECTED_VALUE.ref_number = "string";
    EXPECTED_VALUE.transaction_type = 0;
    EXPECTED_VALUE.transaction_status = 0;
    EXPECTED_VALUE.transaction_hash = "string";
    
    when(transactionLoggingServiceMock.getLoggingByOrderId).
    calledWith(ORDER_ID)
    .mockReturnValue(EXPECTED_VALUE);
    // Assert
    transactionService.submitTransactionHash(ORDER_ID, TRANSACTION_HASH);
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalledWith(ORDER_ID);
    
    await Promise.resolve();
    expect(transactionLoggingServiceMock.updateHash).toHaveBeenCalled();
    expect(transactionLoggingServiceMock.updateHash).toHaveBeenCalledWith(EXPECTED_VALUE, TRANSACTION_HASH);
    await Promise.resolve();
    expect(elasticsearchServiceMock.update).toHaveBeenCalled();
  });

  it('should get transaction hash from elasticsearch', () => {
    // Arrange
    const ORDER_ID = 'string';

    const CALLED_WITH = createSearchObject(ORDER_ID);

    const EXPECTED_RESULT = 'string';

    const ES_RESULT = {
      body: {
        hits: {
          hits: [ { _source: { transaction_hash: EXPECTED_RESULT } } ],
        },
      },
    };
    
    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    // Assert
    expect(transactionService.getTransactionHashFromES(ORDER_ID)).resolves.toEqual(EXPECTED_RESULT);
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should get transaction hash from postgresql', () => {
    // Arrange
    const ORDER_ID = 'string';

    const EXPECTED_RESULT = 'string';

    const EXPECTED_VALUE = new TransactionRequest();
    EXPECTED_VALUE.id = BigInt(0);
    EXPECTED_VALUE.address = "string";
    EXPECTED_VALUE.amount = 0;
    EXPECTED_VALUE.created_at = new Date();
    EXPECTED_VALUE.currency = "string";
    EXPECTED_VALUE.parent_id = BigInt(0);
    EXPECTED_VALUE.ref_number = "string";
    EXPECTED_VALUE.transaction_type = 0;
    EXPECTED_VALUE.transaction_status = 0;
    EXPECTED_VALUE.transaction_hash = "string";

    when(transactionLoggingServiceMock.getLoggingByOrderId)
    .calledWith(ORDER_ID)
    .mockReturnValue(EXPECTED_VALUE);
    // Assert
    expect(transactionService.getTransactionHashFromPG(ORDER_ID)).resolves.toEqual(EXPECTED_RESULT);
    expect(transactionLoggingServiceMock.getLoggingByOrderId).toHaveBeenCalled();
  });
});