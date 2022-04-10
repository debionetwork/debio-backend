import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateTimeModule } from 'src/common';
import { Notification } from './models/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), DateTimeModule],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
