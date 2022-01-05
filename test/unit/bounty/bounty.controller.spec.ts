import { Test, TestingModule } from '@nestjs/testing';
import { BountyController } from '../../../src/endpoints/bounty/bounty.controller';
import { DataStakingEvents } from '../../../src/endpoints/bounty/models/data-staking-events.entity';
import { DataStakingDto } from '../../../src/endpoints/bounty/dto/data-staking.dto';
import { dateTimeProxyMockFactory, fileMockFactory, GCloudStorageServiceMock, MockType, repositoryMockFactory } from '../mock';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { when } from 'jest-when';
import { DateTimeProxy } from '../../../src/common/date-time/date-time.proxy';
import { DataTokenToDatasetMapping } from '../../../src/endpoints/bounty/models/data-token-to-dataset-mapping.entity';
import { GCloudStorageService } from '@aginix/nestjs-gcloud-storage';
import { DataTokenToDatasetMappingDto } from '../../../src/endpoints/bounty/dto/data-token-to-dataset-mapping.dto';

describe('Bounty Controller Unit Tests', () => {
  const fileMock = fileMockFactory();

  let bountyController: BountyController;
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let dataStakingEventsRepositoryMock: MockType<Repository<DataStakingEvents>>;
  let dataTokenToDatasetMappingRepositoryMock: MockType<Repository<DataTokenToDatasetMapping>>;
  let cloudStorageServiceMock: GCloudStorageServiceMock;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BountyController,
        { provide: getRepositoryToken(DataStakingEvents), useFactory: repositoryMockFactory },
        { provide: getRepositoryToken(DataTokenToDatasetMapping), useFactory: repositoryMockFactory },
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory },
        {
            provide: GCloudStorageService,
            useClass: GCloudStorageServiceMock
        },
      ],
    }).compile();

    bountyController = module.get(BountyController);
    dateTimeProxyMock = module.get(DateTimeProxy);
    cloudStorageServiceMock = module.get(GCloudStorageService);
    dataTokenToDatasetMappingRepositoryMock = module.get(getRepositoryToken(DataTokenToDatasetMapping));
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
  

  it('should stake files', () => {
    // Arrange
    const EXPIRES = 0;
    const MAPPING_ID = "MAPPING_ID";
    const TOKEN_ID = "TOKEN_ID";
    const FILENAME = "FILENAME";
    const CALLED_WITH = TOKEN_ID;

    const REPOSITORY_RESULT: DataTokenToDatasetMapping = {
      mapping_id: MAPPING_ID,
      token_id: TOKEN_ID,
      filename: FILENAME,
      created_at: new Date(EXPIRES),
      updated_at: new Date(EXPIRES),
    }
    
    dateTimeProxyMock.nowAndAdd.mockReturnValue(EXPIRES);
    dataTokenToDatasetMappingRepositoryMock.find.mockReturnValue([REPOSITORY_RESULT]);
    
    const READ_SIGNED_URL = ["readurl"];
    fileMock.getSignedUrl.mockReturnValue(READ_SIGNED_URL);
    cloudStorageServiceMock.bucket.file.mockReturnValue(fileMock);
    
    const RESULT: DataTokenToDatasetMappingDto = new DataTokenToDatasetMappingDto(REPOSITORY_RESULT);
    RESULT.file_url = READ_SIGNED_URL[0];

    // Assert
    expect(bountyController.StakedFiles(TOKEN_ID)).resolves.toEqual([RESULT]);
  });
});
