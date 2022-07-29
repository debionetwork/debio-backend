import { TransactionTypeService } from '../../../../../src/common/modules/transaction-type/transaction-type.service';
import { TransactionType } from '../../../../../src/common/modules/transaction-type/models/transaction-type.entity';
import { Repository } from 'typeorm';
import { MockType, repositoryMockFactory } from '../../../mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionTypeList } from '../../../../../src/common/modules/transaction-type/models/transaction-type.list';

describe('Transaction Status Service Unit Tests', () => {
  let transactionTypeService: TransactionTypeService;
  let repositoryTypeMock: MockType<Repository<TransactionType>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionTypeService,
        {
          provide: getRepositoryToken(TransactionType),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    transactionTypeService = module.get(TransactionTypeService);
    repositoryTypeMock = module.get(getRepositoryToken(TransactionType));
  });

  it('should be defined', () => {
    // Assert
    expect(transactionTypeService).toBeDefined();
  });

  it('should get transaction status detail', async () => {
    const TRANSACTION_TYPE = TransactionTypeList.Order;

    const RESULT_TRANSACTION_STATUS = new TransactionType();
    RESULT_TRANSACTION_STATUS.id = 1;
    RESULT_TRANSACTION_STATUS.type = TRANSACTION_TYPE;

    const EXPECTED_PARAM = {
      where: {
        type: TRANSACTION_TYPE,
      },
    };

    repositoryTypeMock.findOne.mockReturnValue(RESULT_TRANSACTION_STATUS);

    expect(
      await transactionTypeService.getTransactionType(TRANSACTION_TYPE),
    ).toEqual(RESULT_TRANSACTION_STATUS);
    expect(repositoryTypeMock.findOne).toHaveBeenCalled();
    expect(repositoryTypeMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAM);
  });
});
