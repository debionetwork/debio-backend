import { Module } from '@nestjs/common';
import { GoogleSecretManagerModule } from '../google-secret-manager';
import { ProcessEnvModule } from '../proxies';
import { SubstrateService } from './substrate.service';

@Module({
  imports: [ProcessEnvModule, GoogleSecretManagerModule],
  providers: [SubstrateService],
  exports: [ProcessEnvModule, SubstrateService],
})
export class SubstrateModule {}

export * from './substrate.service';
