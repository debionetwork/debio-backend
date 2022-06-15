import { Module } from '@nestjs/common';
import { DebioNotificationModule } from '../../common';
import { NotificationController } from './notification.controller';

@Module({
  imports: [DebioNotificationModule],
  controllers: [NotificationController],
})
export class NotificationModule {}
