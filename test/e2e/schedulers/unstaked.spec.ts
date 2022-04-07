import { INestApplication } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { ProcessEnvModule, SubstrateModule } from '../../../src/common';

describe('Unstaked Scheduler (e2e)', () => {
  let schedulerRegistry: SchedulerRegistry;

  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ElasticsearchModule.registerAsync({
          useFactory: async () => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD,
            },
          }),
        }),
        ProcessEnvModule,
        SubstrateModule,
        ScheduleModule.forRoot(),
      ],
    }).compile();

    schedulerRegistry = module.get(ScheduleModule);

    app = module.createNestApplication();
    await app.init();
  });

  it('unstaked-interval must registered', async () => {
    expect(schedulerRegistry.doesExists('interval', 'unstaked-interval')).toBe(
      true,
    );
  });
});
