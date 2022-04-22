import { Test, TestingModule } from '@nestjs/testing';
import { SubstrateListenerHandler } from '../../../../src/listeners/substrate-listener/substrate-listener.handler';
import { ProcessEnvProxy, SubstrateService } from '../../../../src/common';
import { MockType, substrateServiceMockFactory } from '../../mock';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  API_MOCK,
  API_MOCK_GEN,
  BLOCK_HASH_MOCK,
  BLOCK_MOCK,
  CATCH_MOCK,
  ERROR_MOCK,
  EVENT_MOCK,
  FALSE_EVENT_MOCK,
  NUMBER,
  THEN_MOCK,
  TO_HUMAN_MOCK,
} from './substrate-listener.mock.data';
import { Logger } from '@nestjs/common';
import { BlockMetaData } from 'src/listeners/substrate-listener/models/block-metadata.event-model';

const eventsSpy = jest.spyOn(API_MOCK.query.system, 'events');
const getBlockSpy = jest.spyOn(API_MOCK.rpc.chain, 'getBlock');
const getBlockHashSpy = jest.spyOn(API_MOCK.rpc.chain, 'getBlockHash');
const thenSpy = jest.spyOn(THEN_MOCK, 'then');
const catchSpy = jest.spyOn(CATCH_MOCK, 'catch');
const blockSpy = jest.spyOn(BLOCK_MOCK.block.header.number, 'toNumber');
const blockHashSpy = jest.spyOn(BLOCK_HASH_MOCK, 'toString');
const loggerSpy = jest.spyOn(Logger.prototype, 'log');

describe('Substrate Listener Handler Unit Test', () => {
  let substrateListenerHandler: SubstrateListenerHandler;
  let substrateServiceMock: MockType<SubstrateService>;
  let queryBusMock: MockType<QueryBus>;
  let commandBusMock: MockType<CommandBus>;
  let proceccEnvProxy: MockType<ProcessEnvProxy>;// eslint-disable-line

  const commandBusMockFactory: () => MockType<CommandBus> = jest.fn(() => ({
    execute: jest.fn(),
  }));

  const queryBusMockFactory: () => MockType<QueryBus> = jest.fn(() => ({
    execute: jest.fn(),
  }));

  const NODE_ENV = 'development';
  class ProcessEnvProxyMock {
    env = {
      NODE_ENV,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubstrateListenerHandler,
        { provide: SubstrateService, useFactory: substrateServiceMockFactory },
        { provide: QueryBus, useFactory: queryBusMockFactory },
        { provide: CommandBus, useFactory: commandBusMockFactory },
        { provide: ProcessEnvProxy, useClass: ProcessEnvProxyMock },
      ],
    }).compile();

    substrateListenerHandler = module.get<SubstrateListenerHandler>(
      SubstrateListenerHandler,
    );
    substrateServiceMock = module.get(SubstrateService);
    queryBusMock = module.get(QueryBus); // eslint-disable-line
    commandBusMock = module.get(CommandBus);
  });

  it('should be defined', () => {
    // Assert
    expect(substrateListenerHandler).toBeDefined();
    expect(substrateServiceMock).toBeDefined();
    expect(commandBusMock).toBeDefined();
    expect(queryBusMock).toBeDefined();
  });

  it('should initialize module and listen', async () => {
    // Reset
    eventsSpy.mockClear();
    getBlockSpy.mockClear();
    getBlockHashSpy.mockClear();
    thenSpy.mockClear();
    catchSpy.mockClear();
    blockSpy.mockClear();
    blockHashSpy.mockClear();
    loggerSpy.mockClear();
    commandBusMock.execute.mockClear();

    // Arrange
    const ARRAY = [];
    Reflect.set(substrateServiceMock, 'api', API_MOCK_GEN(ARRAY));

    // Act
    await substrateListenerHandler.onModuleInit();

    // Assert
    expect(eventsSpy).toHaveBeenCalledTimes(1);
    expect(thenSpy).toHaveBeenCalledTimes(1);
    expect(catchSpy).toHaveBeenCalledTimes(1);
    expect(getBlockSpy).toHaveBeenCalledTimes(1);
    expect(getBlockHashSpy).toHaveBeenCalledTimes(1);
    expect(getBlockHashSpy).toBeCalledWith(NUMBER);
    expect(blockSpy).toHaveBeenCalledTimes(1);
    expect(blockHashSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      `Event listener catch error ${ERROR_MOCK.name}, ${ERROR_MOCK.message}, ${ERROR_MOCK.stack}`,
    );
    expect(commandBusMock.execute).toHaveBeenCalledTimes(0);
  });

  it('should initialize listen', async () => {
    // Reset
    eventsSpy.mockClear();
    getBlockSpy.mockClear();
    getBlockHashSpy.mockClear();
    thenSpy.mockClear();
    catchSpy.mockClear();
    blockSpy.mockClear();
    blockHashSpy.mockClear();
    loggerSpy.mockClear();
    commandBusMock.execute.mockClear();

    // Arrange
    const ARRAY = [];
    Reflect.set(substrateServiceMock, 'api', API_MOCK_GEN(ARRAY));

    // Act
    await substrateListenerHandler.listenToEvents();

    // Assert
    expect(eventsSpy).toHaveBeenCalledTimes(1);
    expect(thenSpy).toHaveBeenCalledTimes(1);
    expect(catchSpy).toHaveBeenCalledTimes(1);
    expect(getBlockSpy).toHaveBeenCalledTimes(1);
    expect(getBlockHashSpy).toHaveBeenCalledTimes(1);
    expect(getBlockHashSpy).toBeCalledWith(NUMBER);
    expect(blockSpy).toHaveBeenCalledTimes(1);
    expect(blockHashSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      `Event listener catch error ${ERROR_MOCK.name}, ${ERROR_MOCK.message}, ${ERROR_MOCK.stack}`,
    );
    expect(commandBusMock.execute).toHaveBeenCalledTimes(0);
  });

  it('should initialize listen and handle one event', async () => {
    // Reset
    eventsSpy.mockClear();
    getBlockSpy.mockClear();
    getBlockHashSpy.mockClear();
    thenSpy.mockClear();
    catchSpy.mockClear();
    blockSpy.mockClear();
    blockHashSpy.mockClear();
    loggerSpy.mockClear();
    TO_HUMAN_MOCK.toHuman.mockClear();
    commandBusMock.execute.mockClear();

    // Arrange
    const ARRAY = [
      {
        event: EVENT_MOCK,
      },
    ];
    Reflect.set(substrateServiceMock, 'api', API_MOCK_GEN(ARRAY));

    // Act
    await substrateListenerHandler.listenToEvents();

    // Assert
    expect(eventsSpy).toHaveBeenCalledTimes(1);
    expect(thenSpy).toHaveBeenCalledTimes(1);
    expect(catchSpy).toHaveBeenCalledTimes(1);
    expect(getBlockSpy).toHaveBeenCalledTimes(1);
    expect(getBlockHashSpy).toHaveBeenCalledTimes(1);
    expect(getBlockHashSpy).toBeCalledWith(NUMBER);
    expect(blockSpy).toHaveBeenCalledTimes(1);
    expect(blockHashSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledTimes(2);
    expect(loggerSpy).toHaveBeenCalledWith(
      `Event listener catch error ${ERROR_MOCK.name}, ${ERROR_MOCK.message}, ${ERROR_MOCK.stack}`,
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      `Handling substrate event: ${EVENT_MOCK.section}.${EVENT_MOCK.method}`,
    );
    expect(TO_HUMAN_MOCK.toHuman).toHaveBeenCalledTimes(1);
    expect(commandBusMock.execute).toHaveBeenCalledTimes(1);
  });

  it('should handle event', async () => {
    // Reset
    loggerSpy.mockClear();
    TO_HUMAN_MOCK.toHuman.mockClear();
    commandBusMock.execute.mockClear();

    // Arrange
    const BLOCKMETADATA: BlockMetaData = {
      blockHash: 'HASH',
      blockNumber: 1,
    };

    // Act
    await substrateListenerHandler.handleEvent(
      BLOCKMETADATA,
      EVENT_MOCK as any,
    );

    // Assert
    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(TO_HUMAN_MOCK.toHuman).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      `Handling substrate event: ${EVENT_MOCK.section}.${EVENT_MOCK.method}`,
    );
    expect(commandBusMock.execute).toHaveBeenCalledTimes(1);
  });

  it('should not handle event', async () => {
    // Reset
    loggerSpy.mockClear();
    commandBusMock.execute.mockClear();

    // Arrange
    const BLOCKMETADATA: BlockMetaData = {
      blockHash: 'HASH',
      blockNumber: 1,
    };

    // Act
    await substrateListenerHandler.handleEvent(
      BLOCKMETADATA,
      FALSE_EVENT_MOCK as any,
    );

    // Assert
    expect(loggerSpy).toHaveBeenCalledTimes(0);
    expect(commandBusMock.execute).toHaveBeenCalledTimes(0);
  });
});
