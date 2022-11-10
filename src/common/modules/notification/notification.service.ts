import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTimeProxy } from '../proxies/date-time/date-time.proxy';
import { In, Repository } from 'typeorm';
import { NotificationDto } from './dto/notification.dto';
import { Notification } from './models/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  getAllByToId(
    to: string,
    startBlock: string,
    endBlock: string,
    role: string,
    from: string,
  ) {
    return this.notificationRepository.query(
      `
      select
        *
      from
        notification n
      where
        "to" = $1
        and deleted_at is null
        and "role" = $2
        and "from" = $3
        and cast(block_number as BIGINT) between $4 and $5
      order by created_at DESC
      `,
      [to, role, from, startBlock, endBlock],
    );
  }

  insert(data: NotificationDto) {
    const notification = new Notification();
    notification.role = data.role;
    notification.entity_type = data.entity_type;
    notification.entity = data.entity;
    notification.description = data.description;
    notification.read = data.read;
    notification.created_at = data.created_at;
    notification.updated_at = data.updated_at;
    notification.deleted_at = data.deleted_at;
    notification.from = data.from;
    notification.to = data.to;

    return this.notificationRepository.save(notification);
  }

  async setNotificationHasBeenReadById(id) {
    return await this.notificationRepository.update(
      { id },
      {
        updated_at: await this.dateTimeProxy.new(),
        read: true,
      },
    );
  }

  async setNotificationHasBeenReadByIds(ids: string[]) {
    return await this.notificationRepository.update(
      {
        id: In(ids),
        read: false,
      },
      {
        updated_at: await this.dateTimeProxy.new(),
        read: true,
      },
    );
  }

  async setBulkNotificationHasBeenRead(to) {
    return await this.notificationRepository.update(
      {
        to,
        read: false,
      },
      {
        updated_at: await this.dateTimeProxy.new(),
        read: true,
      },
    );
  }
}
