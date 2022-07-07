import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationModule } from '../../../src/endpoints/authentication/authentication.module';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Authentication Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  const apiKey = 'DEBIO_API_KEY';

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['DEBIO_API_KEY', apiKey],
      ['PINATA_SECRET_KEY', process.env.PINATA_SECRET_KEY],
      ['PINATA_USER_ID', process.env.PINATA_USER_ID],
      ['PINATA_EMAIL', process.env.PINATA_EMAIL],
      ['PINATA_EMAIL_VERIFIED', process.env.PINATA_EMAIL_VERIFIED],
      ['PINATA_PIN_POLICY_REGION_ID', process.env.PINATA_PIN_POLICY_REGION_ID],
      [
        'PINATA_PIN_POLICY_REGION_REPL_COUNT',
        process.env.PINATA_PIN_POLICY_REGION_REPL_COUNT,
      ],
      ['PINATA_MFA_ENABLED', process.env.PINATA_MFA_ENABLED],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
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
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

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
