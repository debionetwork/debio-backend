import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RewardService } from '../../../../../src/common';
import { MockType, repositoryMockFactory } from '../../../mock';
import { Repository } from 'typeorm';
import { Reward } from '../../../../../src/common/modules/reward/models/reward.entity';
import { RewardDto } from '../../../../../src/common/modules/reward/dto/reward.dto';

describe('Reward Service Unit Tests', () => {
  let rewardService: RewardService;
  let repositoryMock: MockType<Repository<Reward>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: getRepositoryToken(Reward),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    rewardService = module.get(RewardService);
    repositoryMock = module.get(getRepositoryToken(Reward));
  });

  it('should be defined', () => {
    // Assert
    expect(rewardService).toBeDefined();
  });

  it('should insert', () => {
    // Arrange
    const REWARD_DTO: RewardDto = {
      reward_type: 'string',
      address: 'string',
      created_at: new Date(),
      currency: 'string',
      ref_number: 'string',
      reward_amount: 0,
    };
    const RESULT = 0;
    repositoryMock.save.mockReturnValue(RESULT);

    // Assert
    expect(rewardService.insert(REWARD_DTO)).toEqual(RESULT);
    expect(repositoryMock.save).toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalledWith(REWARD_DTO);
  });

  it('should throw', () => {
    // Arrange
    const REWARD_DTO: RewardDto = {
      reward_type: 'string',
      address: 'string',
      created_at: new Date(),
      currency: 'string',
      ref_number: 'string',
      reward_amount: 0,
    };
    const ERROR = new Error();
    repositoryMock.save.mockImplementation(() => {
      throw ERROR;
    });

    // Assert
    expect(rewardService.insert(REWARD_DTO)).toEqual({ error: ERROR });
    expect(repositoryMock.save).toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalledWith(REWARD_DTO);
  });

  it('should find one', () => {
    // Arrange
    const ACCOUNT_ID = 0;
    const EXPECTED_PARAMS = {
      where: {
        reward_type: 'Registered User',
        address: ACCOUNT_ID,
      },
    };
    const RESULT = 0;
    repositoryMock.findOne.mockReturnValue(RESULT);

    // Assert
    expect(rewardService.getRewardBindingByAccountId(ACCOUNT_ID)).toEqual(
      RESULT,
    );
    expect(repositoryMock.findOne).toHaveBeenCalled();
    expect(repositoryMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAMS);
  });

  it('should throw', () => {
    // Arrange
    const ACCOUNT_ID = 0;
    const EXPECTED_PARAMS = {
      where: {
        reward_type: 'Registered User',
        address: ACCOUNT_ID,
      },
    };
    const ERROR = new Error();
    repositoryMock.findOne.mockImplementation(() => {
      throw ERROR;
    });

    // Assert
    expect(rewardService.getRewardBindingByAccountId(ACCOUNT_ID)).toEqual(
      ERROR,
    );
    expect(repositoryMock.findOne).toHaveBeenCalled();
    expect(repositoryMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAMS);
  });
});
