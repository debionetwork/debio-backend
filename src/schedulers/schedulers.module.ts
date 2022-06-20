import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import {
  EmailNotificationModule,
  GoogleSecretManagerModule,
  GoogleSecretManagerService,
  MailModule,
  ProcessEnvModule,
  SubstrateModule,
  SubstrateService,
} from '../common';
import { MailerService } from './mailer/mailer.service';
import { UnstakedService } from './unstaked/unstaked.service';

@Module({
  imports: [
    GoogleSecretManagerModule,
    ElasticsearchModule.registerAsync({
      imports: [GoogleSecretManagerModule],
      inject: [GoogleSecretManagerService],
      useFactory: async (
        googleSecretManagerService: GoogleSecretManagerService,
      ) => {
        await googleSecretManagerService.accessAndAccessSecret();
        return {
          node: googleSecretManagerService.elasticsearchNode,
          auth: {
            username: googleSecretManagerService.elasticsearchUsername,
            password: googleSecretManagerService.elasticsearchPassword,
          },
        };
      },
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
