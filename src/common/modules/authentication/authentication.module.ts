import { Module } from '@nestjs/common';
import { ProcessEnvModule } from '../proxies';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [
    ProcessEnvModule,
    JwtModule.register({
      secret: process.env.DEBIO_API_KEY,
      // signOptions: { expiresIn: '4h},
    }),
  ],
  providers: [AuthenticationService],
  exports: [ProcessEnvModule, AuthenticationService],
})
export class AuthenticationModule {}
