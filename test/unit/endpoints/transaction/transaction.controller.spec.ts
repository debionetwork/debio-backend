import { TransactionController } from '../../../../src/endpoints/transaction/transaction.controller';
import { elasticsearchServiceMockFactory, MockType } from '../../mock';
import { TransactionService } from '../../../../src/endpoints/transaction/transaction.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionLoggingService } from '../../../../src/common';
import { TransactionRequest } from '../../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { TransactionHashDto } from '../../../../src/endpoints/transaction/dto/transaction-hash.dto';
import { when } from 'jest-when';
import { HttpException } from '@nestjs/common';

describe('Transaction Controller Unit Test', () => {
  let transactionController: MockType<TransactionController>;
  let transactionService: TransactionService;
  let transactionLoggingService: MockType<TransactionLoggingService>;
  let elasticsearchServiceMock: MockType<ElasticsearchService>;

  const createSearchObject = (order_id: string) => {
    return {
      index: 'orders',
      body: {
        query: {
          match: { _id: order_id },
        },
      },
    };
  };

  const transactionLoggingServiceMockFactory: () => MockType<TransactionLoggingService> =
    jest.fn(() => ({
      updateHash: jest.fn(),
      getLoggingByOrderId: jest.fn(),
    }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionController,
        TransactionService,
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        {
          provide: ElasticsearchService,
          useFactory: elasticsearchServiceMockFactory,
        },
      ],
    }).compile();

    transactionController = module.get(TransactionController);
    transactionService = module.get(TransactionService);
    transactionLoggingService = module.get(TransactionLoggingService);
    elasticsearchServiceMock = module.get(ElasticsearchService);
  });

  it('should be defined', () => {
    // Assert
    expect(transactionController).toBeDefined();
  });

  it('should update transaction', async () => {
    const transactionServiceSpy = jest.spyOn(
      transactionService,
      'submitTransactionHash',
    );
    // Arrange
    const EXPECTED_VALUE = new TransactionRequest();
    EXPECTED_VALUE.id = BigInt(0);
    EXPECTED_VALUE.address = 'string';
    EXPECTED_VALUE.amount = 0;
    EXPECTED_VALUE.created_at = new Date();
    EXPECTED_VALUE.currency = 'string';
    EXPECTED_VALUE.parent_id = BigInt(0).toString();
    EXPECTED_VALUE.ref_number = 'string';
    EXPECTED_VALUE.transaction_type = 0;
    EXPECTED_VALUE.transaction_status = 0;
    EXPECTED_VALUE.transaction_hash = 'string';

    const PARAM = new TransactionHashDto();
    PARAM.order_id = 'string';
    PARAM.transaction_hash = 'string';

    when(transactionLoggingService.getLoggingByOrderId)
      .calledWith(PARAM.order_id)
      .mockReturnValue(EXPECTED_VALUE);

    expect(transactionController.submitTransactionHash(PARAM)).resolves.toEqual(
      { status: 'ok' },
    );
    expect(transactionServiceSpy).toHaveBeenCalled();
    expect(transactionLoggingService.getLoggingByOrderId).toHaveBeenCalled();
    expect(transactionLoggingService.getLoggingByOrderId).toHaveBeenCalledWith(
      PARAM.order_id,
    );

    await Promise.resolve();
    expect(transactionLoggingService.updateHash).toHaveBeenCalled();
    expect(transactionLoggingService.updateHash).toHaveBeenCalledWith(
      EXPECTED_VALUE,
      PARAM.transaction_hash,
    );
    await Promise.resolve();
    expect(elasticsearchServiceMock.update).toHaveBeenCalled();
  });

  it('should get transaction hash', () => {
    // Arrange
    const transactionServiceSpy = jest.spyOn(
      transactionService,
      'getTransactionHashFromES',
    );

    const ORDER_ID = 'string';

    const CALLED_WITH = createSearchObject(ORDER_ID);

    const EXPECTED_RESULT = {
      order_id: 'string',
      transaction_hash: 'string',
    };

    const ES_RESULT = {
      body: {
        hits: {
          hits: [{ _source: { transaction_hash: 'string' } }],
        },
      },
    };

    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    // Assert
    expect(transactionController.getTransactionHash(ORDER_ID)).resolves.toEqual(
      EXPECTED_RESULT,
    );
    expect(transactionServiceSpy).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });

  it('should get HTTPException', () => {
    // Arrange
    const transactionServiceSpy = jest.spyOn(
      transactionService,
      'getTransactionHashFromES',
    );

    const ORDER_ID = 'string';

    const CALLED_WITH = createSearchObject(ORDER_ID);

    const ES_RESULT = {
      body: {
        hits: {
          hits: [],
        },
      },
    };
    when(elasticsearchServiceMock.search)
      .calledWith(CALLED_WITH)
      .mockReturnValue(ES_RESULT);

    // Assert
    expect(
      transactionController.getTransactionHash(ORDER_ID),
    ).rejects.toThrowError(HttpException);
    expect(transactionServiceSpy).toHaveBeenCalled();
    expect(elasticsearchServiceMock.search).toHaveBeenCalled();
  });
});
