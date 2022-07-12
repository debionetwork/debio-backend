import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationController } from './authentication.controller';

@Module({
  imports: [
    JwtModule.register({
      signOptions: {
        expiresIn: '5s',
      },
    }),
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
