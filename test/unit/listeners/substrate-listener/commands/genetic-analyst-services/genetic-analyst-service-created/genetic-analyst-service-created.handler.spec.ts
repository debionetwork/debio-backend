import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeProxy } from '../../../../../../../src/common';
import { NotificationService } from '../../../../../../../src/endpoints/notification/notification.service';
import { GeneticAnalystServiceCreatedCommand } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analyst-services/genetic-analyst-service-created/genetic-analyst-service-created.command';
import { GeneticAnalystServiceCreatedCommandHandler } from '../../../../../../../src/listeners/substrate-listener/commands/genetic-analyst-services/genetic-analyst-service-created/genetic-analyst-service-created.handler';
import {
  createMockGeneticAnalystService,
  dateTimeProxyMockFactory,
  mockBlockNumber,
  MockType,
  notificationServiceMockFactory,
} from '../../../../../mock';

describe('Genetic Analyst Service Created Handler Event', () => {
  let notificationServiceMock: MockType<NotificationService>;
  let geneticAnalystServiceCreatedHandler: MockType<GeneticAnalystServiceCreatedCommandHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NotificationService,
          useFactory: notificationServiceMockFactory,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
        GeneticAnalystServiceCreatedCommandHandler,
      ],
    }).compile();

    notificationServiceMock = module.get(NotificationService);
    geneticAnalystServiceCreatedHandler = module.get(
      GeneticAnalystServiceCreatedCommandHandler,
    );

    await module.init();
  });

  it('should defined Genetic Analyst Service Created Handler', () => {
    expect(geneticAnalystServiceCreatedHandler).toBeDefined();
  });

  it('should called notification service insert', async () => {
    // Arrange
    const geneticAnalystService = createMockGeneticAnalystService();
    const geneticAnalystServiceData = geneticAnalystService.toHuman();

    const geneticAnaystServiceCreatedCommand =
      new GeneticAnalystServiceCreatedCommand( // eslint-disable-line
        [geneticAnalystService],
        mockBlockNumber(),
      );

    await geneticAnalystServiceCreatedHandler.execute(
      geneticAnaystServiceCreatedCommand,
    );

    expect(notificationServiceMock.insert).toHaveBeenCalled();
    expect(notificationServiceMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'GA',
        entity_type: 'Genetic Analyst',
        entity: 'Add service',
        description: `You've successfully added your new service - ${geneticAnalystServiceData.info.name}.`,
        read: false,
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalystServiceData.ownerId,
      }),
    );
  });
});
