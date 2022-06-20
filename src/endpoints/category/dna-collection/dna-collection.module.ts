import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DnaCollectionCategory } from './models/dna-collection.entity';
import { DnaCollectionController } from './dna-collection.controller';
import { DnaCollectionService } from './dna-collection.service';

@Module({
  imports: [TypeOrmModule.forFeature([DnaCollectionCategory])],
  controllers: [DnaCollectionController],
  providers: [DnaCollectionService],
})
export class DnaCollectionModule {}
