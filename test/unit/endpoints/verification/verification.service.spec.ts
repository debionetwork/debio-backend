import { Test, TestingModule } from '@nestjs/testing';
import {
  dateTimeProxyMockFactory,
  MockType,
  notificationServiceMockFactory,
} from '../../mock';
import { when } from 'jest-when';
import { TransactionLoggingService } from '../../../../src/common/modules/transaction-logging/transaction-logging.service';
import { VerificationService } from '../../../../src/endpoints/verification/verification.service';
import { DateTimeProxy, SubstrateService } from '../../../../src/common';
import {
  convertToDbioUnitString,
  sendRewards,
  updateLabVerificationStatus,
  updateGeneticAnalystVerificationStatus,
} from '@debionetwork/polkadot-provider';
import { NotificationService } from '../../../../src/common/modules/notification/notification.service';
import { TransactionLoggingDto } from '../../../../src/common/modules/transaction-logging/dto/transaction-logging.dto';
import { TransactionTypeList } from '../../../../src/common/modules/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '../../../../src/common/modules/transaction-status/models/transaction-status.list';

jest.mock('@debionetwork/polkadot-provider', () => ({
  sendRewards: jest.fn(
    (_param1, _param2, _param3, _param4, param5) => param5 && param5(),
  ),
  updateLabVerificationStatus: jest.fn(
    (_param1, _param2, _param3, _param4, param5) => param5 && param5(),
  ),
  updateGeneticAnalystVerificationStatus: jest.fn(
    (_param1, _param2, _param3, _param4, param5) => param5 && param5(),
  ),
  convertToDbioUnitString: jest.fn(),
}));

describe('Verification Service Unit Tests', () => {
  let verificationService: VerificationService;
  let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let substrateServiceMock: MockType<SubstrateService>;

  const API = 'API';
  const PAIR = 'PAIR';

  const substrateServiceMockFactory: () => MockType<SubstrateService> = jest.fn(
    () => ({
      onModuleInit: jest.fn(),
      startListen: jest.fn(),
      stopListen: jest.fn(),
    }),
  );

  const transactionLoggingServiceMockFactory: () => MockType<TransactionLoggingService> =
    jest.fn(() => ({
      create: jest.fn((entity) => entity),
    }));

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: TransactionLoggingService,
          useFactory: transactionLoggingServiceMockFactory,
        },
        { provide: SubstrateService, useFactory: substrateServiceMockFactory },
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory },
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
      ],
    }).compile();

    verificationService = module.get(VerificationService);
    transactionLoggingServiceMock = module.get(TransactionLoggingService);

    dateTimeProxyMock = module.get(DateTimeProxy);

    substrateServiceMock = module.get(SubstrateService);
    Reflect.set(substrateServiceMock, 'api', API);
    Reflect.set(substrateServiceMock, 'pair', PAIR);

    (updateLabVerificationStatus as jest.Mock).mockClear();
    (updateGeneticAnalystVerificationStatus as jest.Mock).mockClear();
    (sendRewards as jest.Mock).mockClear();
    (convertToDbioUnitString as jest.Mock).mockClear();
  });

  it('should be defined', () => {
    // Assert
    expect(verificationService).toBeDefined();
  });

  it('should update genetic analyst status', async () => {
    const ACCOUNT_ID = 'ACCOUNT_ID';
    const VERIFICATION_STATUS = 'Verified';

    await verificationService.verificationGeneticAnalyst(
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );

    expect(updateGeneticAnalystVerificationStatus).toHaveBeenCalledTimes(1);
    expect(updateGeneticAnalystVerificationStatus).toHaveBeenCalledWith(
      API,
      PAIR,
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );
  });

  it('should not send reward', async () => {
    // Arrange
    const NOW = 0;
    const ACCOUNT_ID = 'ACCOUNT_ID';
    const VERIFICATION_STATUS = 'Rejected';

    const PARAM: TransactionLoggingDto = {
      address: ACCOUNT_ID,
      amount: 2,
      created_at: new Date(NOW),
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: '-',
      transaction_type: TransactionTypeList.Reward,
      transaction_status: TransactionStatusList.LabVerified,
    };

    const EXPECTED_RESULTS = 'EXPECTED_RESULTS';
    when(transactionLoggingServiceMock.create)
      .calledWith(PARAM)
      .mockReturnValue(EXPECTED_RESULTS);
    dateTimeProxyMock.now.mockReturnValue(NOW);

    // Act
    await verificationService.verificationLab(ACCOUNT_ID, VERIFICATION_STATUS);

    // Assert
    expect(updateLabVerificationStatus).toHaveBeenCalledTimes(1);
    expect(updateLabVerificationStatus).toHaveBeenCalledWith(
      API,
      PAIR,
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledTimes(0);
    expect(sendRewards).toHaveBeenCalledTimes(0);
  });

  it('should send reward', async () => {
    // Arrange
    const NOW = 0;
    const ACCOUNT_ID = 'ACCOUNT_ID';
    const VERIFICATION_STATUS = 'Verified';
    const REWARD_AMOUNT = 2;
    const PARAM: TransactionLoggingDto = {
      address: ACCOUNT_ID,
      amount: REWARD_AMOUNT,
      created_at: new Date(NOW),
      currency: 'DBIO',
      parent_id: BigInt(0),
      ref_number: '-',
      transaction_type: TransactionTypeList.Reward,
      transaction_status: TransactionStatusList.LabVerified,
    };

    const EXPECTED_RESULTS = 'EXPECTED_RESULTS';
    when(transactionLoggingServiceMock.create)
      .calledWith(PARAM)
      .mockReturnValue(EXPECTED_RESULTS);
    dateTimeProxyMock.now.mockReturnValue(NOW);

    // Act
    await verificationService.verificationLab(ACCOUNT_ID, VERIFICATION_STATUS);

    // Assert
    expect(updateLabVerificationStatus).toHaveBeenCalledTimes(1);
    expect(updateLabVerificationStatus).toHaveBeenCalledWith(
      API,
      PAIR,
      ACCOUNT_ID,
      VERIFICATION_STATUS,
    );
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledTimes(1);
    expect(transactionLoggingServiceMock.create).toHaveBeenCalledWith(PARAM);
    expect(sendRewards).toHaveBeenCalledTimes(1);
    expect(convertToDbioUnitString).toHaveBeenCalledTimes(1);
  });
});
