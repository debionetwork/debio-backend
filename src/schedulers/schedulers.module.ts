import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';
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
    GCloudSecretManagerModule,
    ElasticsearchModule.registerAsync({
      imports: [GCloudSecretManagerModule],
      inject: [GCloudSecretManagerService],
      useFactory: async (
        gCloudSecretManagerService: GCloudSecretManagerService,
      ) => {
        await gCloudSecretManagerService.loadSecrets();
        return {
          node: process.env.ELASTICSEARCH_NODE,
          auth: {
            username: gCloudSecretManagerService
              .getSecret('ELASTICSEARCH_USERNAME')
              .toString(),
            password: gCloudSecretManagerService
              .getSecret('ELASTICSEARCH_PASSWORD')
              .toString(),
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
