import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyriadAccount } from './models/myriad-account.entity';
import { MyriadController } from './myriad.controller';
import { MyriadService } from './myriad.service';

@Module({
  imports: [TypeOrmModule.forFeature([MyriadAccount])],
  controllers: [MyriadController],
  providers: [MyriadService],
  exports: [TypeOrmModule]
})
export class MyriadModule {}
