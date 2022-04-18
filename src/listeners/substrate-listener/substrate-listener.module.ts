import { Module } from '@nestjs/common';
import { EscrowModule } from '../../common/modules/escrow/escrow.module';
import {
  DateTimeModule,
  DebioConversionModule,
  MailModule,
  ProcessEnvModule,
  RewardModule,
  SubstrateModule,
  TransactionLoggingModule,
} from '../../common';
import { GeneticTestingCommandHandlers } from './commands/genetic-testing';
import { ServiceRequestCommandHandlers } from './commands/service-request';
import { GeneticAnalystCommandHandlers } from './commands/genetic-analysts';
import { GeneticAnalysisOrderCommandHandlers } from './commands/genetic-analysis-order';
import { GeneticAnalysisCommandHandlers } from './commands/genetic-analysis';
import { ServiceCommandHandlers } from './commands/services';
import { SubstrateListenerHandler } from './substrate-listener.handler';
import { OrderCommandHandlers } from './commands/orders';
import { CqrsModule } from '@nestjs/cqrs';
import { LocationModule } from '../../endpoints/location/location.module';
import { NotificationModule } from '../../endpoints/notification/notification.module';

@Module({
  imports: [
    ProcessEnvModule,
    EscrowModule,
    LocationModule,
    TransactionLoggingModule,
    SubstrateModule,
    DebioConversionModule,
    RewardModule,
    MailModule,
    CqrsModule,
    DateTimeModule,
    NotificationModule
  ],
  providers: [
    SubstrateListenerHandler,
    ...ServiceCommandHandlers,
    ...GeneticTestingCommandHandlers,
    ...ServiceRequestCommandHandlers,
    ...OrderCommandHandlers,
    ...GeneticTestingCommandHandlers,
    ...GeneticAnalysisOrderCommandHandlers,
    ...GeneticAnalysisCommandHandlers,
    ...GeneticAnalystCommandHandlers,
  ],
})
export class SubstrateListenerModule {}
