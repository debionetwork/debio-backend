import { Test, TestingModule } from '@nestjs/testing';
import { ProcessEnvModule, ProcessEnvProxy } from '../../../../../src/common';

require('dotenv').config(); // eslint-disable-line

describe('Process Env Proxy Set Default Unit Tests', () => {
  let proxy: ProcessEnvProxy;

  const WOW = 'WOW';
  process.env.WEB = WOW;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ProcessEnvModule.setDefault({
          URL: 'RPC',
          WEB: 'WEB',
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
    expect(proxy.env.WEB).toEqual(WOW);
  });
});
