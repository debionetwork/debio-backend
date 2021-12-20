import { Test, TestingModule } from '@nestjs/testing';
import { UnstakedService } from './unstaked.service';

describe('UnstakedService', () => {
  let service: UnstakedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnstakedService],
    }).compile();

    service = module.get<UnstakedService>(UnstakedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
