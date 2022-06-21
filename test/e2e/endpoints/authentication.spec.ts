import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'http';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationModule } from '../../../src/endpoints/authentication/authentication.module';
import { GoogleSecretManagerService } from '../../../src/common';

describe('Authentication Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;

  const apiKey = 'DEBIO_API_KEY';
  class GoogleSecretManagerServiceMock {
    async accessSecret() {
      return null;
    }
    debioApiKey = apiKey;
    pinataSecretKey = process.env.PINATA_SECRET_KEY;
    pinataPrivateKey = process.env.PINATA_PRIVATE_KEY;
    pinataUserId = process.env.PINATA_USER_ID;
    pinataEmail = process.env.PINATA_EMAIL;
    pinataEmailVerified = process.env.PINATA_EMAIL_VERIFIED;
    pinataPinPolicyRegionId = process.env.PINATA_PIN_POLICY_REGION_ID;
    pinataPinPolicyRegionReplCount =
      process.env.PINATA_PIN_POLICY_REGION_REPL_COUNT;
    pinataMfaEnabled = process.env.PINATA_MFA_ENABLED;
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
      .overrideProvider(GoogleSecretManagerService)
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
