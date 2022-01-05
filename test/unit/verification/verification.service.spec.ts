import { Test, TestingModule } from '@nestjs/testing';
import { dateTimeProxyMockFactory, MockType } from '../mock';
import { when } from 'jest-when';
import { DateTimeProxy } from '../../../src/common/date-time';
import { SubstrateService } from '../../../src/substrate/substrate.service';
import { RewardService } from '../../../src/reward/reward.service';
import { VerificationService } from '../../../src/endpoints/verification/verification.service';
import { RewardDto } from '../../../src/reward/dto/reward.dto';

describe('Verification Service Unit Tests', () => {
  let verificationService: VerificationService;
  let dateTimeProxyMock: MockType<DateTimeProxy>;

  const substrateServiceMockFactory: () => MockType<SubstrateService> = jest.fn(() => ({
    verificationLabWithSubstrate: jest.fn(entity => entity),
    sendReward: jest.fn(entity => entity),
  }));
  let substrateServiceMock: MockType<SubstrateService>;
  
  const rewardServiceMockFactory: () => MockType<RewardService> = jest.fn(() => ({
    insert: jest.fn(entity => entity),
  }));
  let rewardServiceMock: MockType<RewardService>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: SubstrateService, useFactory: substrateServiceMockFactory },
        { provide: RewardService, useFactory: rewardServiceMockFactory },
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory }
      ],
    }).compile();
    dateTimeProxyMock = module.get(DateTimeProxy);
    substrateServiceMock = module.get(SubstrateService);
    rewardServiceMock = module.get(RewardService);
    verificationService = module.get(VerificationService);
  });

  it('should be defined', () => {
    // Assert
    expect(verificationService).toBeDefined();
  });

  it('should not send reward', async () => {
    // Arrange
    const NOW = 0;
    const ACCOUNT_ID = "ACCOUNT_ID";
    const VERIFICATION_STATUS = "VERIFICATION_STATUS";

    const PARAM: RewardDto = {
      address: ACCOUNT_ID,
      ref_number: '-',
      reward_amount: 2,
      reward_type: 'Lab Verified',
      currency: 'DBIO',
      created_at: new Date(NOW),
    }
    
    const EXPECTED_RESULTS = "EXPECTED_RESULTS";
    when(rewardServiceMock.insert).calledWith(PARAM).mockReturnValue(EXPECTED_RESULTS);
    dateTimeProxyMock.now.mockReturnValue(NOW);

    // Act
    const RESULTS = await verificationService.vericationLab(ACCOUNT_ID, VERIFICATION_STATUS);
    
    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(substrateServiceMock.verificationLabWithSubstrate).toHaveBeenCalledTimes(1);
    expect(substrateServiceMock.verificationLabWithSubstrate).toHaveBeenCalledWith(ACCOUNT_ID, VERIFICATION_STATUS);
    expect(rewardServiceMock.insert).toHaveBeenCalledTimes(1);
    expect(rewardServiceMock.insert).toHaveBeenCalledWith(PARAM);
    expect(substrateServiceMock.sendReward).toHaveBeenCalledTimes(0);
  });

  it('should send reward', async () => {
    // Arrange
    const NOW = 0;
    const ACCOUNT_ID = "ACCOUNT_ID";
    const VERIFICATION_STATUS = "Verified";
    const PARAM: RewardDto = {
        address: ACCOUNT_ID,
        ref_number: '-',
        reward_amount: 2,
        reward_type: 'Lab Verified',
        currency: 'DBIO',
        created_at: new Date(NOW),
    }

    const EXPECTED_RESULTS = "EXPECTED_RESULTS";
    when(rewardServiceMock.insert).calledWith(PARAM).mockReturnValue(EXPECTED_RESULTS);
    dateTimeProxyMock.now.mockReturnValue(NOW);
    
    // Act
    const RESULTS = await verificationService.vericationLab(ACCOUNT_ID, VERIFICATION_STATUS);

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(substrateServiceMock.verificationLabWithSubstrate).toHaveBeenCalledTimes(1);
    expect(substrateServiceMock.verificationLabWithSubstrate).toHaveBeenCalledWith(ACCOUNT_ID, VERIFICATION_STATUS);
    expect(rewardServiceMock.insert).toHaveBeenCalledTimes(1);
    expect(rewardServiceMock.insert).toHaveBeenCalledWith(PARAM);
    expect(substrateServiceMock.sendReward).toHaveBeenCalledTimes(1);
    expect(substrateServiceMock.sendReward).toHaveBeenCalledWith(ACCOUNT_ID, 2);
  });
});
