import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RatingModule } from '../src/rating/rating.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { LabRating } from '../src/rating/models/rating.entity';
import { RatingService } from '../src/rating/rating.service';

describe('Rating Controller (e2e)', () => {
  let app: INestApplication;

  const mockRatings = {
    lab_id: '1',
    service_id: '0xs89393',
    order_id: '0xj3mj4',
    rating_by: 'Jordan',
    rating: 4,
    created: new Date()
  }

  const RatingServiceProvider = {
    provide: RatingService,
    useFactory: () => ({
      create: jest.fn(),
      getRatingByLabId: jest.fn(),
    }),
  }

  const RatingRepository = {
    create: jest.fn().mockResolvedValue(mockRatings),
    save: jest.fn().mockReturnValue(Promise.resolve())
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RatingModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.HOST_POSTGRES,
          port: 5432,
          username: process.env.USERNAME_POSTGRES,
          password: process.env.PASSWORD_POSTGRES,
          database: process.env.DB_POSTGRES,
          entities: [LabRating],
          autoLoadEntities: true,
        }),
      ],
      providers: [
        RatingService,
        RatingServiceProvider,
        {
          provide: getRepositoryToken(LabRating),
          useValue: RatingRepository,
        },
      ],
    })  
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/rating (GET) by lab_id "3" success', () => {
    request(app.getHttpServer())
      .get('/rating/3')
      .then((response) => {
        expect(response.body).toEqual({
          status: 'ok',
          data : expect.any(Object)
        })
      })
  });

  it('/rating (GET) by lab_id "3" success get from cache', () => {
    request(app.getHttpServer())
      .get('/rating/3')
      .then((response) => {
        expect(response.body).toEqual({
          status: 'ok',
          data : expect.any(Object)
        })
      })
  });

  it('/rating (GET) by lab_id "zzzz" rating will be null', () => {
    request(app.getHttpServer())
      .get('/rating/zzzz')
      .then((response) => {
        expect(response.body).toEqual({
          status: 'ok',
          data : {
            lab_id: 'zzzz',
            rating: null
          }
        })
      })
  });

  it('/rating (POST) return status 200', () => {
    request(app.getHttpServer())
    .post('/rating')
    .send(mockRatings)
    .expect(201);
  });

  it('/rating (POST) return status 500 Internal Server Error', () => {
    request(app.getHttpServer())
    .post('/rating')
    .send(null)
    .expect(500);
  });
});
