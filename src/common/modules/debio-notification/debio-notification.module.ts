import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateTimeModule } from '../proxies/date-time/date-time.module';
import { DebioNotificationService } from './debio-notification.service';
import { Notification } from './models/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), DateTimeModule],
  providers: [DebioNotificationService],
  exports: [DateTimeModule, DebioNotificationService],
})
export class DebioNotificationModule {}
