import { Module } from '@nestjs/common';
import {
  EmailNotificationModule,
  MailModule,
  SubstrateModule,
} from '../../common';
import { NotificationModule } from '../notification/notification.module';
import { EmailEndpointController } from './email.controller';

@Module({
  imports: [MailModule, SubstrateModule, EmailNotificationModule, NotificationModule],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}
