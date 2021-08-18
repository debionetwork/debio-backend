import { forwardRef, Module } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { SubstrateController } from './substrate.controller';
import { EscrowModule } from 'src/escrow/escrow.module';
import { QualityControlledModule } from 'src/quality-Controlled/quality-controlled.module';

@Module({
  imports: [
    forwardRef(() => EscrowModule),
    QualityControlledModule
  ],
  controllers: [SubstrateController],
  providers: [SubstrateService,],
  exports: [SubstrateService],
})
export class SubstrateModule {}
