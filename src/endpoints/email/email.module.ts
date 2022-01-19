import { Module } from '@nestjs/common';
import { MailModule, ProcessEnvModule, SubstrateModule } from '../../common';
import { EmailEndpointController } from './email.controller';

@Module({
  imports: [
    MailModule, 
    SubstrateModule,
  ],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}
