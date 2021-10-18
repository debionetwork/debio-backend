import { Test, TestingModule } from '@nestjs/testing';
import { BountyController } from './bounty.controller';

describe('BountyController', () => {
  let controller: BountyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BountyController],
    }).compile();

    controller = module.get<BountyController>(BountyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
