import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabRating } from './rating/models/rating.entity';
import { LocationEntities } from './location/models';
import { LocationModule } from './location/location.module';
import { RatingModule } from './rating/rating.module';
import { EthereumModule } from './ethereum/ethereum.module';
import { EscrowModule } from './escrow/escrow.module';
import { SubstrateModule } from './substrate/substrate.module';
// import dotenv from 'dotenv';

require('dotenv').config(); // eslint-disable-line
// dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST_POSTGRES,
      port: 5432,
      username: process.env.USERNAME_POSTGRES,
      password: process.env.PASSWORD_POSTGRES,
      database: process.env.DB_POSTGRES,
      entities: [...LocationEntities, LabRating],
      autoLoadEntities: true,
    }),
    LocationModule,
    RatingModule,
    EthereumModule,
    EscrowModule,
    SubstrateModule,
  ],
})
export class AppModule {}
