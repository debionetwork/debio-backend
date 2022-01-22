import { Test, TestingModule } from '@nestjs/testing';
import { SubstrateListenerHandler } from '../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { SubstrateService } from '../../../../src/common';
import { MockType, substrateServiceMockFactory } from '../../mock';
import { CommandBus } from '@nestjs/cqrs';
import { API_MOCK } from './substrate-listener.mock.data';

describe('Substrate Listener Handler Unit Test', () => {
  let substrateListenerHandler: SubstrateListenerHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let commandBusMock: MockType<CommandBus>;

  const commandBusMockFactory: () => MockType<CommandBus> = jest.fn(() => ({
    execute: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubstrateListenerHandler,
        { provide: SubstrateService, useFactory: substrateServiceMockFactory },
        { provide: CommandBus, useFactory: commandBusMockFactory },
      ],
    }).compile();

    substrateListenerHandler = module.get<SubstrateListenerHandler>(SubstrateListenerHandler);
    substrateServiceMock = module.get(SubstrateService);
    commandBusMock = module.get(CommandBus);

    Reflect.set(substrateServiceMock, 'api', API_MOCK);
  });

  it('should be defined', () => {
    expect(substrateListenerHandler).toBeDefined();
    expect(substrateServiceMock).toBeDefined();
    expect(commandBusMock).toBeDefined();
  });
});
