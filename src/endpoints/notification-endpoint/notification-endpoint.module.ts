import { Module } from '@nestjs/common';
import { NotificationModule } from '../../common';
import { NotificationEndpointController } from './notification-endpoint.controller';

@Module({
  imports: [NotificationModule],
  controllers: [NotificationEndpointController],
})
export class NotificationEndpointModule {}
