import { EmailSenderModule } from '@common/modules/email-sender/email-sender.module';
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
    EmailSenderModule,
  ],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}
