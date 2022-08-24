import request from 'supertest';
import { CacheModule, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'http';
import { NotificationEndpointModule } from '../../../src/endpoints/notification-endpoint/notification-endpoint.module';
import { DateTimeModule } from '../../../src/common';
import { Notification } from '../../../src/common/modules/notification/models/notification.entity';
import { dummyCredentials } from '../config';
import { DataListIdDto } from '../../../src/endpoints/notification-endpoint/dto/data-list-id.dto';

describe('Notification controller (E2E)', () => {
  let server: Server;
  let app: INestApplication;
  const ID = 1;
  const RECEIVERONE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const RECEIVERTWO = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQ5';

  const bodyDTO: DataListIdDto = {
    ids: ['4', '5', '6'],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        NotificationEndpointModule,
        CacheModule.register(),
        DateTimeModule,
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [Notification],
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('should get notification', async () => {
    const result = await request(server)
      .get(
        `/notification/${RECEIVERONE}?start_block=0&end_block=1&role=Lab&from=Debio Network`,
      )
      .send();

    const data = result.body.data;

    expect(data.length).toEqual(1);
    expect(data[0].role).toEqual('Lab');
    expect(data[0].from).toEqual('Debio Network');
    expect(data[0].read).toEqual(false);
  });

  it('should read notification', async () => {
    const updateResult = await request(server)
      .put(`/notification/set-read/${ID}`)
      .send();

    expect(updateResult.body.data.affected).toEqual(1);

    const result = await request(server)
      .get(
        `/notification/${RECEIVERONE}?start_block=0&end_block=1&role=Lab&from=Debio Network`,
      )
      .send();

    const data = result.body.data;

    expect(data.length).toEqual(1);
    expect(data[0].role).toEqual('Lab');
    expect(data[0].from).toEqual('Debio Network');
    expect(data[0].read).toEqual(true);
  });

  it('should read notification by ids', async () => {
    const updateResult = await request(server)
      .put(`/notification/set-read-many`)
      .send(bodyDTO);

    expect(updateResult.body.data.affected).toEqual(3);

    const result = await request(server)
      .get(
        `/notification/${RECEIVERTWO}?start_block=4&end_block=6&role=GA&from=Debio Network`,
      )
      .send();

    const data = result.body.data;

    expect(data.length).toEqual(3);
    expect(data[0].role).toEqual('GA');
    expect(data[0].from).toEqual('Debio Network');
    expect(data[0].read).toEqual(true);
  });

  it('should bulk read notification', async () => {
    const updateResult = await request(server)
      .put(`/notification/set-bulk-read/${RECEIVERONE}`)
      .send();

    expect(updateResult.body.data.affected).toEqual(2);

    const result = await request(server)
      .get(
        `/notification/${RECEIVERONE}?start_block=1&end_block=5&role=Lab&from=Debio Network`,
      )
      .send();

    const data = result.body.data;

    expect(data.length).toBeGreaterThan(1);
    expect(data[1].role).toEqual('Lab');
    expect(data[1].from).toEqual('Debio Network');
    expect(data[1].read).toEqual(true);
    expect(data[2].role).toEqual('Lab');
    expect(data[2].from).toEqual('Debio Network');
    expect(data[2].read).toEqual(true);
  });
});
