import { Module } from '@nestjs/common';
import { MyriadController } from './myriad.controller';
import { MyriadService } from './myriad.service';

@Module({
  controllers: [MyriadController],
  providers: [MyriadService],
})
export class MyriadModule {}
