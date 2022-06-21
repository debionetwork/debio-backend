import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../proxies/process-env/process-env.module';
import { GoogleSecretManagerService } from './google-secret-manager.service';

@Module({
  imports: [ProcessEnvModule],
  providers: [GoogleSecretManagerService],
  exports: [GoogleSecretManagerService],
})
export class GoogleSecretManagerModule {}
