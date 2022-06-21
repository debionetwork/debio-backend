import { Module } from '@nestjs/common';
import { EscrowModule } from '../../common/modules/escrow/escrow.module';
import {
  DateTimeModule,
  DebioConversionModule,
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
  MailModule,
  NotificationModule,
  ProcessEnvModule,
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
import { LabCommandHandlers } from './commands/labs';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { BlockCommandHandlers, BlockQueryHandlers } from './blocks';
import { GeneticAnalystServiceCommandHandler } from './commands/genetic-analyst-services';

@Module({
  imports: [
    ProcessEnvModule,
    EscrowModule,
    LocationModule,
    TransactionLoggingModule,
    SubstrateModule,
    DebioConversionModule,
    MailModule,
    CqrsModule,
    DateTimeModule,
    NotificationModule,
    GoogleSecretManagerModule,
    ElasticsearchModule.registerAsync({
      imports: [GoogleSecretManagerModule],
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => {
        await googleSecretManagerService.accessSecret();
        return {
          node: googleSecretManagerService.elasticsearchNode,
          auth: {
            username: googleSecretManagerService.elasticsearchUsername,
            password: googleSecretManagerService.elasticsearchPassword,
          },
        };
      },
    }),
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
    ...LabCommandHandlers,
    ...BlockCommandHandlers,
    ...BlockQueryHandlers,
    ...GeneticAnalystServiceCommandHandler,
  ],
})
export class SubstrateListenerModule {}
