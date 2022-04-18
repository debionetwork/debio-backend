import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTimeProxy } from '../../../src/common';
import { Repository } from 'typeorm';
import { NotificationDto } from './dto/notification.dto';
import { Notification } from './models/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly dateTimeProxy: DateTimeProxy,
  ) {}

  getAllByToId(to: string) {
    return this.notificationRepository.find({
      where: {
        to,
        deleted_at: null,
      },
      order: {
        updated_at: 'DESC',
      },
    });
  }

  insert(data: NotificationDto) {
    try {
      return this.notificationRepository.save(data);
    } catch (error) {
      return error;
    }
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

  async setBulkNotificationHasBeenRead(to) {
    return await this.notificationRepository.update(
      { to },
      {
        updated_at: await this.dateTimeProxy.new(),
        read: true,
      },
    );
  }
}
