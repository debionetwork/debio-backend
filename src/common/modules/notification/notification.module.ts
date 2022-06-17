import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateTimeModule } from '../proxies/date-time/date-time.module';
import { NotificationService } from './notification.service';
import { Notification } from './models/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), DateTimeModule],
  providers: [NotificationService],
  exports: [DateTimeModule, NotificationService],
})
export class NotificationModule {}
