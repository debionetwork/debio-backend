import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationModule } from '../../../src/endpoints/authentication/authentication.module';
import { ProcessEnvProxy } from '../../../src/common';

describe('Authentication Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  const apiKey = 'DEBIO_API_KEY';
  class ProcessEnvProxyMock {
    env = {
      DEBIO_API_KEY: apiKey,
    };
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          signOptions: {
            expiresIn: '5s',
          },
        }),
        AuthenticationModule,
      ],
      providers: [
        {
          provide: ProcessEnvProxy,
          useClass: ProcessEnvProxyMock,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it('GET /auth/pinata-jwt: check should return', async () => {
    // Act
    const result = await request(server)
      .get('/auth/pinata-jwt')
      .set('debio-api-key', apiKey)
      .send();

    // Assert
    expect(result.status).toEqual(200);

    // prettier-ignore
    expect(
        JSON.stringify(result).includes('jwt'),
    ).toEqual(true);
  }, 30000);
});
