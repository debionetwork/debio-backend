import { Test, TestingModule } from '@nestjs/testing';
import { ProcessEnvProxy } from '../../../../../src/common';

describe('Substrate Health Indicator Unit Tests', () => {
  let proxy: ProcessEnvProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessEnvProxy],
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
    Reflect.set(proxy.env, 'URL', EXPECTED_RESULT);

    // Assert
    expect(proxy.env.URL).toEqual(EXPECTED_RESULT);
  });
});
