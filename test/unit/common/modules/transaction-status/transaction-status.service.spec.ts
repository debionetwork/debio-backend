import { TransactionStatusService } from '../../../../../src/common/modules/transaction-status/transaction-status.service';
import { TransactionStatus } from '../../../../../src/common/modules/transaction-status/models/transaction-status.entity';
import { Repository } from 'typeorm';
import { MockType, repositoryMockFactory } from '../../../mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStatusList } from '../../../../../src/common/modules/transaction-status/models/transaction-status.list';

describe('Transaction Status Service Unit Tests', () => {
  let transactionStatusService: TransactionStatusService;
  let repositoryStatusMock: MockType<Repository<TransactionStatus>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionStatusService,
        {
          provide: getRepositoryToken(TransactionStatus),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    transactionStatusService = module.get(TransactionStatusService);
    repositoryStatusMock = module.get(getRepositoryToken(TransactionStatus));
  });

  it('should be defined', () => {
    // Assert
    expect(transactionStatusService).toBeDefined();
  });

  it('should get transaction status detail', async () => {
    const TYPE_ID = 1;
    const TRANSACTION_STATUS = TransactionStatusList.Unpaid;

    const RESULT_TRANSACTION_STATUS = new TransactionStatus();
    RESULT_TRANSACTION_STATUS.id = 1;
    RESULT_TRANSACTION_STATUS.id_type = TYPE_ID;
    RESULT_TRANSACTION_STATUS.transaction_status = TRANSACTION_STATUS;

    const EXPECTED_PARAM = {
      where: {
        id_type: TYPE_ID,
        transaction_status: TRANSACTION_STATUS,
      },
    };

    repositoryStatusMock.findOne.mockReturnValue(RESULT_TRANSACTION_STATUS);

    expect(
      await transactionStatusService.getTransactionStatus(
        TYPE_ID,
        TRANSACTION_STATUS,
      ),
    ).toEqual(RESULT_TRANSACTION_STATUS);
    expect(repositoryStatusMock.findOne).toHaveBeenCalled();
    expect(repositoryStatusMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAM);
  });
});
