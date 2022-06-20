import { Module } from '@nestjs/common';
import { GoogleSecretManagerService } from './google-secret-manager.service';

@Module({
  providers: [GoogleSecretManagerService],
  exports: [GoogleSecretManagerService],
})
export class GoogleSecretManagerModule {}
