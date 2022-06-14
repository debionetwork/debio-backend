import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionLoggingService } from '../../../../../src/common';
import { MockType, repositoryMockFactory } from '../../../mock';
import { Repository } from 'typeorm';
import { TransactionRequest } from '../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { TransactionLoggingDto } from '../../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto';

describe('Transaction Logging Service Unit Tests', () => {
  let transactionLoggingService: TransactionLoggingService;
  let repositoryMock: MockType<Repository<TransactionRequest>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionLoggingService,
        {
          provide: getRepositoryToken(TransactionRequest),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    transactionLoggingService = module.get(TransactionLoggingService);
    repositoryMock = module.get(getRepositoryToken(TransactionRequest));
  });

  it('should be defined', () => {
    // Assert
    expect(transactionLoggingService).toBeDefined();
  });

  it('should create', () => {
    // Arrange
    const TRN_DTO: TransactionLoggingDto = {
      address: 'string',
      amount: 0,
      created_at: new Date(),
      currency: 'string',
      parent_id: BigInt(0),
      ref_number: 'string',
      transaction_status: 0,
      transaction_type: 0,
    };
    const EXPECTED_PARAM = new TransactionRequest();
    EXPECTED_PARAM.address = TRN_DTO.address;
    EXPECTED_PARAM.amount = TRN_DTO.amount;
    EXPECTED_PARAM.created_at = TRN_DTO.created_at;
    EXPECTED_PARAM.currency = TRN_DTO.currency;
    EXPECTED_PARAM.parent_id = TRN_DTO.parent_id.toString();
    EXPECTED_PARAM.ref_number = TRN_DTO.ref_number;
    EXPECTED_PARAM.transaction_type = TRN_DTO.transaction_type;
    EXPECTED_PARAM.transaction_status = TRN_DTO.transaction_status;
    const RESULT = 0;
    repositoryMock.save.mockReturnValue(RESULT);

    // Assert
    expect(transactionLoggingService.create(TRN_DTO)).toEqual(RESULT);
    expect(repositoryMock.save).toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalledWith(EXPECTED_PARAM);
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
    repositoryMock.findOne.mockReturnValue(RESULT);

    // Assert
    expect(transactionLoggingService.getLoggingByOrderId(REF_NUMBER)).toEqual(
      RESULT,
    );
    expect(repositoryMock.findOne).toHaveBeenCalled();
    expect(repositoryMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAM);
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
    repositoryMock.findOne.mockReturnValue(RESULT);

    // Assert
    expect(
      transactionLoggingService.getLoggingByHashAndStatus(REF_NUMBER, TRN_NUM),
    ).toEqual(RESULT);
    expect(repositoryMock.findOne).toHaveBeenCalled();
    expect(repositoryMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAM);
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
    repositoryMock.update.mockReturnValue(RESULT);

    // Asserts
    transactionLoggingService.updateHash(EXPECTED_PARAM, transaction_hash);
    expect(repositoryMock.update).toHaveBeenCalled();
    expect(repositoryMock.update).toHaveBeenCalledWith(
      EXPECTED_PARAM.id.toString(),
      EXPECTED_PARAM,
    );
  });
});
