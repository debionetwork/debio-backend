import { Test, TestingModule } from '@nestjs/testing';
import { ProcessEnvModule, ProcessEnvProxy } from '../../../../../src/common';

describe('Process Env Proxy Set Default Unit Tests', () => {
  let proxy: ProcessEnvProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ProcessEnvModule.setDefault({
          URL: 'RPC',
        }),
      ],
    }).compile();

    proxy = module.get(ProcessEnvProxy);
  });

  it('should be defined', () => {
    expect(proxy).toBeDefined();
    expect(proxy.env).toBeDefined();
  });

  it('should reflected', () => {
    // Arrange
    const EXPECTED_RESULT = 'RPC';

    // Assert
    expect(proxy.env.URL).toEqual(EXPECTED_RESULT);
  });
});
