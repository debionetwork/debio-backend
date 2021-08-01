import { Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SubstrateController } from './substrate.controller';

@Module({
  imports: [],
  providers: [SubstrateController, SubstrateService],
  exports: [SubstrateController, SubstrateService],
})
export class SubstrateModule {}
