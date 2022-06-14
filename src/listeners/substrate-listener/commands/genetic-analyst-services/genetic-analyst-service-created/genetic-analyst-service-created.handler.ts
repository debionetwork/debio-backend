import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateTimeProxy } from '../../../../../common';
import { NotificationService } from '../../../../../endpoints/notification/notification.service';
import { GeneticAnalystServiceCreatedCommand } from './genetic-analyst-service-created.command';
import { NotificationDto } from '../../../../../endpoints/notification/dto/notification.dto';

@Injectable()
@CommandHandler(GeneticAnalystServiceCreatedCommand)
export class GeneticAnalystServiceCreatedCommandHandler
  implements ICommandHandler<GeneticAnalystServiceCreatedCommand>
{
  private readonly logger: Logger = new Logger(
    GeneticAnalystServiceCreatedCommandHandler.name,
  );
  constructor(
    private readonly notificationService: NotificationService,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  async execute(command: GeneticAnalystServiceCreatedCommand) {
    const geneticAnalystService = command.geneticAnalystService;
    try {
      const geneticAnalystServiceNotification: NotificationDto = {
        role: 'GA',
        entity_type: 'Genetic Analyst',
        entity: 'Add service',
        description: `You've successfully added your new service - ${geneticAnalystService.info.name}.`,
        read: false,
        created_at: this.dateTimeProxy.new(),
        updated_at: this.dateTimeProxy.new(),
        deleted_at: null,
        from: 'Debio Network',
        to: geneticAnalystService.ownerId,
      };

      this.notificationService.insert(geneticAnalystServiceNotification);
    } catch (error) {
      this.logger.log(error);
    }
  }
}
