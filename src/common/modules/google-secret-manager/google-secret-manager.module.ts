import { Global, Module } from '@nestjs/common';
import { GoogleSecretManagerService } from './google-secret-manager.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: GoogleSecretManagerService,
      useValue: new GoogleSecretManagerService(),
    },
  ],
  exports: [GoogleSecretManagerService],
})
export class GoogleSecretManagerModule {}
