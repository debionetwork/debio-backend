import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { BountyModule } from '../../../src/endpoints/bounty/bounty.module';
import { DataStakingEvents } from '../../../src/endpoints/bounty/models/data-staking-events.entity';
import { DateTimeModule } from '../../../src/common/modules/proxies/date-time';
import { DataTokenToDatasetMapping } from '../../../src/endpoints/bounty/models/data-token-to-dataset-mapping.entity';
import { dummyCredentials } from '../config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStakingDto } from '../../../src/endpoints/bounty/dto/data-staking.dto';
import { GCloudStorageModule } from '@aginix/nestjs-gcloud-storage';
import { DataTokenToDatasetMappingDto } from '../../../src/endpoints/bounty/dto/data-token-to-dataset-mapping.dto';

describe('Bounty Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  const data: DataStakingDto = {
    order_id: 'ORDER_ID',
    service_category_id: 1,
    filename: 'FILE',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GCloudStorageModule.withConfig({
          defaultBucketname: process.env.BUCKET_NAME,
          storageBaseUri: process.env.STORAGE_BASE_URI,
          predefinedAcl: 'private',
        }),
        BountyModule,
        DateTimeModule,
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [DataStakingEvents, DataTokenToDatasetMapping],
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('POST /create-sync-event: CreateSyncEvent should return', async () => {
    // Act
    const result = await request(server)
      .post('/bounty/create-sync-event')
      .send(data);

    // Assert
    expect(result.status).toEqual(201);
    const jsonObject = JSON.parse(result.text);
    const dtoEqual: DataStakingDto = {
      ...jsonObject,
    };
    expect(jsonObject).toEqual(dtoEqual);
  }, 30000);

  it('GET /staked-files: StakedFiles should return', async () => {
    // Act
    const result = await request(server)
      .get('/bounty/staked-files?tokenId')
      .query({ tokenId: '' })
      .send(data);

    // Assert
    expect(result.status).toEqual(200);
    const jsonObject = JSON.parse(result.text);
    const dtoEqual: DataTokenToDatasetMappingDto[] = jsonObject;
    expect(jsonObject).toEqual(dtoEqual);
  }, 30000);
});
