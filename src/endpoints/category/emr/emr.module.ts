import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmrController } from './emr.controller';
import { EmrService } from './emr.service';
import { EmrCategory } from './models/emr.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmrCategory])],
  controllers: [EmrController],
  providers: [EmrService],
})
export class EmrModule {}
