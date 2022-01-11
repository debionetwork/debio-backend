import { Module } from '@nestjs/common';
import { MailModule, SubstrateModule } from 'src/common';
import { EmailEndpointController } from './email.controller';

@Module({
  imports: [MailModule, SubstrateModule],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}
