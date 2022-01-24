import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailNotification } from './email-notification.entity';
import { EmailNotificationService } from './email-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailNotification])],
  providers: [EmailNotificationService],
  exports: [EmailNotificationService, TypeOrmModule],
})
export class EmailNotificationModule {}
