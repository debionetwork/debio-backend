import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionLoggingService } from '../../../../../src/common';
import { MockType, repositoryMockFactory } from '../../../mock';
import { Repository } from 'typeorm';
import { TransactionRequest } from '../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { TransactionLoggingDto } from '../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto';
import { TransactionStatusList } from '../../../../../src/common/modules/transaction-status/models/transaction-status.list';
import { TransactionTypeList } from '../../../../../src/common/modules/transaction-type/models/transaction-type.list';
import { TransactionStatusService } from '../../../../../src/common/modules/transaction-status/transaction-status.service';
import { TransactionTypeService } from '../../../../../src/common/modules/transaction-type/transaction-type.service';
import { TransactionStatus } from '../../../../../src/common/modules/transaction-status/models/transaction-status.entity';
import { TransactionType } from '../../../../../src/common/modules/transaction-type/models/transaction-type.entity';

describe('Transaction Logging Service Unit Tests', () => {
  let transactionLoggingService: TransactionLoggingService;
  let repositoryLoggingMock: MockType<Repository<TransactionRequest>>;
  let repositoryStatusMock: MockType<Repository<TransactionStatus>>;
  let repositoryTypeMock: MockType<Repository<TransactionType>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionLoggingService,
        TransactionStatusService,
        TransactionTypeService,
        {
          provide: getRepositoryToken(TransactionRequest),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(TransactionStatus),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(TransactionType),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    transactionLoggingService = module.get(TransactionLoggingService);
    repositoryLoggingMock = module.get(getRepositoryToken(TransactionRequest));
    repositoryStatusMock = module.get(getRepositoryToken(TransactionStatus));
    repositoryTypeMock = module.get(getRepositoryToken(TransactionType));
  });

  it('should be defined', () => {
    // Assert
    expect(transactionLoggingService).toBeDefined();
  });

  it('should create', async () => {
    // Arrange
    const TRN_DTO: TransactionLoggingDto = {
      address: 'string',
      amount: 0,
      created_at: new Date(),
      currency: 'string',
      parent_id: BigInt(0),
      ref_number: 'string',
      transaction_status: TransactionStatusList.Unpaid,
      transaction_type: TransactionTypeList.Order,
    };

    const RESULT_TRANSACTION_STATUS = new TransactionStatus();
    RESULT_TRANSACTION_STATUS.id = 1;
    RESULT_TRANSACTION_STATUS.id_type = 1;
    RESULT_TRANSACTION_STATUS.transaction_status = TransactionStatusList.Unpaid;

    const RESULT_TRANSACTION_TYPE = new TransactionType();
    RESULT_TRANSACTION_TYPE.id = 1;
    RESULT_TRANSACTION_TYPE.type = TransactionTypeList.Order;

    const EXPECTED_PARAM = new TransactionRequest();
    EXPECTED_PARAM.address = TRN_DTO.address;
    EXPECTED_PARAM.amount = TRN_DTO.amount;
    EXPECTED_PARAM.created_at = TRN_DTO.created_at;
    EXPECTED_PARAM.currency = TRN_DTO.currency;
    EXPECTED_PARAM.parent_id = TRN_DTO.parent_id.toString();
    EXPECTED_PARAM.ref_number = TRN_DTO.ref_number;
    EXPECTED_PARAM.transaction_type = RESULT_TRANSACTION_TYPE.id;
    EXPECTED_PARAM.transaction_status = RESULT_TRANSACTION_STATUS.id;

    const RESULT = 0;
    repositoryLoggingMock.save.mockReturnValue(RESULT);
    repositoryStatusMock.findOne.mockReturnValue(RESULT_TRANSACTION_STATUS);
    repositoryTypeMock.findOne.mockReturnValue(RESULT_TRANSACTION_TYPE);

    // Assert
    expect(await transactionLoggingService.create(TRN_DTO)).toEqual(RESULT);
    expect(repositoryLoggingMock.save).toHaveBeenCalled();
    expect(repositoryLoggingMock.save).toHaveBeenCalledWith(EXPECTED_PARAM);
  });

  it('should get logging by order id', () => {
    // Arrange
    const REF_NUMBER = 'string';
    const EXPECTED_PARAM = {
      where: {
        ref_number: REF_NUMBER,
        parent_id: BigInt(0).toString(),
      },
    };
    const RESULT = 0;
    repositoryLoggingMock.findOne.mockReturnValue(RESULT);

    // Assert
    expect(transactionLoggingService.getLoggingByOrderId(REF_NUMBER)).toEqual(
      RESULT,
    );
    expect(repositoryLoggingMock.findOne).toHaveBeenCalled();
    expect(repositoryLoggingMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAM);
  });

  it('should get logging by hash and status', () => {
    // Arrange
    const TRN_NUM = 0;
    const REF_NUMBER = 'string';
    const EXPECTED_PARAM = {
      where: {
        ref_number: REF_NUMBER,
        transaction_status: TRN_NUM,
      },
    };
    const RESULT = 0;
    repositoryLoggingMock.findOne.mockReturnValue(RESULT);

    // Assert
    expect(
      transactionLoggingService.getLoggingByHashAndStatus(REF_NUMBER, TRN_NUM),
    ).toEqual(RESULT);
    expect(repositoryLoggingMock.findOne).toHaveBeenCalled();
    expect(repositoryLoggingMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAM);
  });

  it('should update transaction hash', () => {
    // Arrange
    const transaction_hash = 'string';

    const RESULT = 0;
    const EXPECTED_PARAM = new TransactionRequest();
    EXPECTED_PARAM.id = BigInt(0);
    EXPECTED_PARAM.address = 'string';
    EXPECTED_PARAM.amount = 0;
    EXPECTED_PARAM.created_at = new Date();
    EXPECTED_PARAM.currency = 'string';
    EXPECTED_PARAM.parent_id = BigInt(0).toString();
    EXPECTED_PARAM.ref_number = 'string';
    EXPECTED_PARAM.transaction_type = 0;
    EXPECTED_PARAM.transaction_status = 0;
    EXPECTED_PARAM.transaction_hash = 'string';
    repositoryLoggingMock.update.mockReturnValue(RESULT);

    // Asserts
    transactionLoggingService.updateHash(EXPECTED_PARAM, transaction_hash);
    expect(repositoryLoggingMock.update).toHaveBeenCalled();
    expect(repositoryLoggingMock.update).toHaveBeenCalledWith(
      EXPECTED_PARAM.id.toString(),
      EXPECTED_PARAM,
    );
  });
});
