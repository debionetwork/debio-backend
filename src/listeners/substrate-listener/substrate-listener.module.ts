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
import { ServiceCommandHandlers } from './commands/services';
import { SubstrateListenerHandler } from './substrate-listener.handler';
import { OrderCommandHandlers } from './commands/orders';
import { CqrsModule } from '@nestjs/cqrs';
import { LocationModule } from '../../endpoints/location/location.module';

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
  ],
  providers: [
    SubstrateListenerHandler,
    ...ServiceCommandHandlers,
    ...GeneticTestingCommandHandlers,
    ...ServiceRequestCommandHandlers,
    ...OrderCommandHandlers,
  ],
})
export class SubstrateListenerModule {}
