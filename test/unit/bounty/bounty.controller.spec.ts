import { Test, TestingModule } from '@nestjs/testing';
import { BountyController } from '../../../src/bounty/bounty.controller';
import { DataStakingEvents } from '../../../src/bounty/models/data-staking-events.entity';
import { DataStakingDto } from '../../../src/bounty/dto/data-staking.dto';
import { dateTimeProxyMockFactory, MockType, repositoryMockFactory } from '../mock';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { when } from 'jest-when';
import { DateTimeProxy } from '../../../src/common/date-time/date-time.proxy';

describe('Bounty Controller Unit Tests', () => {
  let bountyController: BountyController;
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let dataStakingEventsRepositoryMock: MockType<Repository<DataStakingEvents>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BountyController,
        { provide: getRepositoryToken(DataStakingEvents), useFactory: repositoryMockFactory },
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory }
      ],
    }).compile();
    dateTimeProxyMock = module.get(DateTimeProxy);
    bountyController = module.get(BountyController);
    dataStakingEventsRepositoryMock = module.get(getRepositoryToken(DataStakingEvents));
  });

  it('should be defined', () => {
    // Assert
    expect(bountyController).toBeDefined();
  });

  it('should find all categories', () => {
    // Arrange
    const EXPIRES = 0;
    const dataStakingDto: DataStakingDto = {
        order_id: "1",
        service_category_id: 1,
        filename: "1"
    }
    const CALLED_WITH = new DataStakingEvents();
    CALLED_WITH.order_id = dataStakingDto.order_id;
    CALLED_WITH.service_category_id = dataStakingDto.service_category_id;
    CALLED_WITH.filename = dataStakingDto.filename;
    CALLED_WITH.created_at = new Date(EXPIRES);
    CALLED_WITH.event_processed = false;
    const RESULT = "TADA"

    dateTimeProxyMock.now.mockReturnValue(EXPIRES);
    when(dataStakingEventsRepositoryMock.save).calledWith(CALLED_WITH).mockReturnValue(RESULT);

    // Assert
    expect(bountyController.CreateSyncEvent(dataStakingDto)).resolves.toEqual(RESULT);
    expect(dataStakingEventsRepositoryMock.save).toHaveBeenCalled();
  });
});
