import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRating } from '../rating/models/rating.entity';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { SubstrateModule } from '../substrate/substrate.module';

require('dotenv').config(); // eslint-disable-line
@Module({
  imports: [
    TypeOrmModule.forFeature([LabRating]),
    forwardRef(() => SubstrateModule),
  ],
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [TypeOrmModule, EscrowService],
})
export class EscrowModule {}
