import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import {
  EmailNotificationModule,
  MailModule,
  ProcessEnvModule,
  SubstrateModule,
  SubstrateService,
} from '../common';
import { MailerService } from './mailer/mailer.service';
import { UnstakedService } from './unstaked/unstaked.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
      }),
    }),
    ProcessEnvModule,
    SubstrateModule,
    MailModule,
    EmailNotificationModule,
  ],
  exports: [ElasticsearchModule],
  providers: [UnstakedService, SubstrateService, MailerService],
})
export class SchedulersModule {}
