import { Module } from '@nestjs/common';
import { PinataController } from './pinata.controller';
import { PinataService } from './pinata.service';

@Module({
  providers: [PinataService],
  controllers: [PinataController],
})
export class PinataModule {}
