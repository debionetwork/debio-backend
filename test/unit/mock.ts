import {
  DateTimeProxy,
  EthereumService,
  CachesService,
  SubstrateService,
  MailerManager,
  TransactionLoggingService,
} from '../../src/common';
import { Repository } from 'typeorm';
import { Cache as CacheManager } from 'cache-manager';
import { File, Bucket } from '@google-cloud/storage';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MailerService } from '@nestjs-modules/mailer';
import { CountryService } from '../../src/endpoints/location/country.service';
import { StateService } from '../../src/endpoints/location/state.service';

export function mockFunction(args){} // eslint-disable-line

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>; // eslint-disable-line
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    find: jest.fn((entity) => entity),
    findOne: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    update: jest.fn((entity) => entity),
    findOneOrFail: jest.fn((entity) => entity),
  }),
);

export const dateTimeProxyMockFactory: () => MockType<DateTimeProxy> = jest.fn(
  () => ({
    new: jest.fn((entity) => entity),
    now: jest.fn((entity) => entity),
    nowAndAdd: jest.fn((entity) => entity),
  }),
);

export const fileMockFactory: () => MockType<File> = jest.fn(() => ({
  getSignedUrl: jest.fn((entity) => entity),
}));

export const bucketMockFactory: () => MockType<Bucket> = jest.fn(() => ({
  file: jest.fn((entity) => entity),
}));
export class GCloudStorageServiceMock {
  bucket = bucketMockFactory();
}

export const elasticsearchServiceMockFactory: () => MockType<ElasticsearchService> =
  jest.fn(() => ({
    delete: jest.fn((entity) => entity),
    deleteByQuery: jest.fn((entity) => entity),
    index: jest.fn((entity) => entity),
    update: jest.fn((entity) => entity),
    updateByQuery: jest.fn((entity) => entity),
    search: jest.fn((entity) => entity),
    ping: jest.fn(),
  }));

export const mailerServiceMockFactory: () => MockType<MailerService> = jest.fn(
  () => ({
    sendMail: jest.fn((entity) => entity),
  }),
);

export const cacheMockFactory: () => MockType<CacheManager> = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

export const cachesServiceMockFactory: () => MockType<CachesService> = jest.fn(
  () => ({
    getLastBlock: jest.fn(),
    setLastBlock: jest.fn(),
  }),
);

export const substrateServiceMockFactory: () => MockType<SubstrateService> =
  jest.fn(() => ({
    onModuleInit: jest.fn(),
    startListen: jest.fn(),
    stopListen: jest.fn(),
  }));

export const ethereumServiceMockFactory: () => MockType<EthereumService> =
  jest.fn(() => ({
    getLastBlock: jest.fn(),
    setLastBlock: jest.fn(),
    createWallet: jest.fn(),
    getEthersProvider: jest.fn(),
    getContract: jest.fn(),
    getEscrowSmartContract: jest.fn(),
  }));

export const MockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

export const transactionLoggingServiceMockFactory: () => MockType<TransactionLoggingService> =
  jest.fn(() => ({
    create: jest.fn(),
    updateHash: jest.fn(),
    getLoggingByOrderId: jest.fn(),
    getLoggingByHashAndStatus: jest.fn(),
  }));

export const countryServiceMockFactory: () => MockType<CountryService> =
  jest.fn(() => ({
    getAll: jest.fn(),
    getByIso2Code: jest.fn(),
  }));

export const stateServiceMockFactory: () => MockType<StateService> = jest.fn(
  () => ({
    getAllRegion: jest.fn(),
    getState: jest.fn(),
  }),
);

export const mailerManagerMockFactory: () => MockType<MailerManager> = jest.fn(
  () => ({
    sendCustomerStakingRequestServiceEmail: jest.fn(),
    sendLabRegistrationEmail: jest.fn(),
  }),
);
