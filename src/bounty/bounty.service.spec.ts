import { Test, TestingModule } from '@nestjs/testing';
import { BountyService } from './bounty.service';

describe('BountyService', () => {
  let service: BountyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BountyService],
    }).compile();

    service = module.get<BountyService>(BountyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
