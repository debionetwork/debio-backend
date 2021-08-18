import { forwardRef, Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SubstrateController } from './substrate.controller';
import { EscrowModule } from 'src/escrow/escrow.module';
import { LoggingModule } from 'src/logging/logging.module';

@Module({
  imports: [forwardRef(() => EscrowModule), LoggingModule],
  controllers: [SubstrateController],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}
