import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SentryInterceptor } from '../../common';
import { notificationData } from '../../common/modules/notification/models/response';
import { NotificationService } from '../../common/modules/notification/notification.service';
import { DataListIdDto } from './dto/data-list-id.dto';

@UseInterceptors(SentryInterceptor)
@Controller('notification')
export class NotificationEndpointController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':to_id')
  @ApiParam({ name: 'to_id' })
  @ApiOperation({ description: 'get all notification by receiver.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: notificationData,
    },
  })
  async getAllNotificationByToId(
    @Param('to_id') to_id: string,
    @Query('start_block') startBlock: string,
    @Query('end_block') endBlock: string,
    @Query('role') role: string,
    @Query('from') from: string,
  ) {
    try {
      return {
        data: await this.notificationService.getAllByToId(
          to_id,
          startBlock,
          endBlock,
          role,
          from,
        ),
      };
    } catch (error) {
      return error;
    }
  }

  @Put('set-read/:notification_id')
  @ApiParam({ name: 'notification_id' })
  @ApiOperation({ description: 'update data notification to hasbeen read.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: {
          generatedMaps: [],
          raw: [],
          affected: 1,
        },
      },
    },
  })
  async setNotificationHasbeenReadById(
    @Param('notification_id') notification_id: string,
  ) {
    try {
      return {
        data: await this.notificationService.setNotificationHasBeenReadById(
          notification_id,
        ),
      };
    } catch (error) {
      return error;
    }
  }

  @Put('set-read-many')
  @ApiBody({ type: DataListIdDto })
  @ApiOperation({
    description: 'update data notification to hasbeen read by list id.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: {
          generatedMaps: [],
          raw: [],
          affected: 1,
        },
      },
    },
  })
  async setNotificationHasbeenReadByIds(@Body() dto: DataListIdDto) {
    try {
      return {
        data: await this.notificationService.setNotificationHasBeenReadByIds(
          dto.ids,
        ),
      };
    } catch (error) {
      return error;
    }
  }

  @Put('set-bulk-read/:to_id')
  @ApiParam({ name: 'to_id' })
  @ApiOperation({ description: 'set all notification receiver hasbeed read' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: {
          generatedMaps: [],
          raw: [],
          affected: 9,
        },
      },
    },
  })
  async setBulkNotificationHasbeenRead(@Param('to_id') to_id: string) {
    try {
      return {
        data: await this.notificationService.setBulkNotificationHasBeenRead(
          to_id,
        ),
      };
    } catch (error) {
      return error;
    }
  }
}
