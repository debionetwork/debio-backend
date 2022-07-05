import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import helmet = require('helmet');
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();

  const gCloudSecretManagerService = app.get(GCloudSecretManagerService);

  if (process.env.SWAGGER_ENABLE === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Debio API')
      .setDescription('the Debio API Documentation')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const SENTRY_DSN = gCloudSecretManagerService
    .getSecret('SENTRY_DSN')
    .toString();

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
    });
  }

  await cryptoWaitReady();
  await app.listen(process.env.PORT);
}
bootstrap();
