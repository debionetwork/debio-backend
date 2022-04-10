import { Controller, Get, Param, Put, UseInterceptors } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";
import { SentryInterceptor } from "../../common";
import { NotificationService } from "./notification.service";

@UseInterceptors(SentryInterceptor)
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @Get(':to_id')
  @ApiParam({ name: 'to'})
  getAllNotificationByToId(@Param('to') to: string) {
    try {
      return {
        data: this.notificationService.getAllByToId(to)
      }
    } catch (error) {
      return error
    }
  }

  @Put('set-read/:notification_id')
  @ApiParam({ name: 'notification_id'})
  setNotificationHasbeenReadById(@Param('notification_id') notification_id: string){
    try {
      return {
        data: this.notificationService.setNotificationHasBeenReadById(notification_id)
      }
    } catch (error) {
      return error
    }
  }

  @Put('set-bulk-read/:to_id')
  @ApiParam({ name: 'to_id'})
  setBulkNotificationHasbeenRead(@Param('to_id') to_id: string){
    try {
      return {
        data: this.notificationService.setBulkNotificationHasBeenRead(to_id)
      }
    } catch (error) {
      return error
    }
  }
}