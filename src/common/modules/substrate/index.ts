import { Module } from '@nestjs/common';
import { GoogleSecretManagerModule } from '../google-secret-manager';
import { SubstrateService } from './substrate.service';

@Module({
  imports: [GoogleSecretManagerModule],
  providers: [SubstrateService],
  exports: [GoogleSecretManagerModule, SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';
