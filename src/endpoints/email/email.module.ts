import { Module } from '@nestjs/common';
import {
  EmailNotificationModule,
  MailModule,
  ProcessEnvModule,
  SubstrateModule,
} from '../../common';
import { EmailEndpointController } from './email.controller';

@Module({
  imports: [
    MailModule,
    SubstrateModule,
    EmailNotificationModule,
    ProcessEnvModule,
  ],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}
