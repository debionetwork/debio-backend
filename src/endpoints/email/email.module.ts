import { GCloudSecretManagerModule } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Module } from '@nestjs/common';
import {
  EmailNotificationModule,
  MailModule,
  SubstrateModule,
} from '../../common';
import { EmailEndpointController } from './email.controller';

@Module({
  imports: [
    MailModule,
    SubstrateModule,
    EmailNotificationModule,
    GCloudSecretManagerModule,
  ],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}
