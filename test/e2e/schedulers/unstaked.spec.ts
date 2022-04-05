import { INestApplication } from "@nestjs/common";
import { ElasticsearchModule, ElasticsearchService } from "@nestjs/elasticsearch";
import { ScheduleModule, SchedulerRegistry } from "@nestjs/schedule";
import { Test, TestingModule } from "@nestjs/testing";
import { ProcessEnvModule, SubstrateModule, SubstrateService } from "../../../src/common";
import { UnstakedService } from "../../../src/schedulers/unstaked/unstaked.service";

describe('Unstaked Scheduler (e2e)', () => {
  let service: UnstakedService;
  let substrateService: SubstrateService;
  let schedulerRegistry: SchedulerRegistry;
  let elasticsearchService: ElasticsearchService;

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

    service = module.get(UnstakedService);
    substrateService = module.get(SubstrateService);
    schedulerRegistry = module.get(ScheduleModule);
    elasticsearchService = module.get(ElasticsearchService);
    
    app = module.createNestApplication();
    await app.init();
  });

  it('unstaked-interval must registered', async () => {
    expect(schedulerRegistry.doesExists('interval', 'unstaked-interval')).toBe(true);
  });
});