import { Module } from '@nestjs/common';
import {
  EmailNotificationModule,
  GoogleSecretManagerModule,
  MailModule,
  SubstrateModule,
} from '../../common';
import { EmailEndpointController } from './email.controller';

@Module({
  imports: [
    MailModule,
    SubstrateModule,
    EmailNotificationModule,
    GoogleSecretManagerModule,
  ],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}
