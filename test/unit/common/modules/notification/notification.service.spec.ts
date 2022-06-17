import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DateTimeProxy, NotificationService } from '../../../../../src/common';
import {
  dateTimeProxyMockFactory,
  MockType,
  repositoryMockFactory,
} from '../../../mock';
import { Repository } from 'typeorm';
import { Notification } from '../../../../../src/common/modules/notification/models/notification.entity';
import { NotificationDto } from '../../../../../src/common/modules/notification/dto/notification.dto';

describe('Debio Notification Service Unit Tests', () => {
  let debioNotificationService: NotificationService;
  let repositoryMock: MockType<Repository<Notification>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useFactory: repositoryMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
      ],
    }).compile();
    debioNotificationService = module.get(NotificationService);
    repositoryMock = module.get(getRepositoryToken(Notification));
  });

  it('should be defined', () => {
    // Assert
    expect(debioNotificationService).toBeDefined();
  });

  it('should create', () => {
    // Arrange
    const NOTIF_DTO: NotificationDto = {
      role: 'string',
      entity_type: 'string',
      entity: 'string',
      description: `string`,
      read: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      from: 'string',
      to: 'string',
    };
    const EXPECTED_PARAM = new NotificationDto();
    EXPECTED_PARAM.role = NOTIF_DTO.role;
    EXPECTED_PARAM.entity_type = NOTIF_DTO.entity_type;
    EXPECTED_PARAM.entity = NOTIF_DTO.entity;
    EXPECTED_PARAM.description = NOTIF_DTO.description;
    EXPECTED_PARAM.read = NOTIF_DTO.read;
    EXPECTED_PARAM.created_at = NOTIF_DTO.created_at;
    EXPECTED_PARAM.updated_at = NOTIF_DTO.updated_at;
    EXPECTED_PARAM.deleted_at = NOTIF_DTO.deleted_at;
    EXPECTED_PARAM.from = NOTIF_DTO.from;
    EXPECTED_PARAM.to = NOTIF_DTO.to;
    const RESULT = 0;
    repositoryMock.save.mockReturnValue(RESULT);

    // Assert
    expect(debioNotificationService.insert(NOTIF_DTO)).toEqual(RESULT);
    expect(repositoryMock.save).toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalledWith(EXPECTED_PARAM);
  });

  it('should notification has been read by id', async () => {
    // Arrange
    const ID = 0;
    const RESULT = 0;
    repositoryMock.update.mockReturnValue(RESULT);

    // Assert
    expect(
      await debioNotificationService.setNotificationHasBeenReadById(ID),
    ).toEqual(RESULT);
    expect(repositoryMock.update).toHaveBeenCalled();
    expect(repositoryMock.update).toHaveBeenCalledWith(
      {
        id: ID,
      },
      expect.objectContaining({
        read: true,
      }),
    );
  });

  it('should bulk notification has been read', async () => {
    // Arrange
    const TO = 0;
    const RESULT = 0;
    repositoryMock.update.mockReturnValue(RESULT);

    // Assert
    expect(
      await debioNotificationService.setBulkNotificationHasBeenRead(TO),
    ).toEqual(RESULT);
    expect(repositoryMock.update).toHaveBeenCalled();
    expect(repositoryMock.update).toHaveBeenCalledWith(
      {
        to: TO,
      },
      expect.objectContaining({
        read: true,
      }),
    );
  });
});
