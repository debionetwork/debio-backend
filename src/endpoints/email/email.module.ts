import { Module } from '@nestjs/common';
import { MailModule, ProcessEnvModule, SubstrateModule } from '../../common';
import { EmailEndpointController } from './email.controller';

@Module({
  imports: [
    MailModule, 
    SubstrateModule,
    ProcessEnvModule,
  ],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}
