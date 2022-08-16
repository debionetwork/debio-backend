import {
  DateTimeProxy,
  EthereumService,
  CachesService,
  SubstrateService,
  TransactionLoggingService,
  DebioConversionService,
  MailerManager,
  EmailNotificationService,
} from '../../src/common';
import {
  OrderStatus,
  GeneticAnalysisStatus,
  GeneticAnalysisOrderStatus,
} from '@debionetwork/polkadot-provider';
import { Repository } from 'typeorm';
import { Cache as CacheManager } from 'cache-manager';
import { File, Bucket } from '@google-cloud/storage';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MailerService } from '@nestjs-modules/mailer';
import { EscrowService } from '../../src/common/modules/escrow/escrow.service';
import { CountryService } from '../../src/endpoints/location/country.service';
import { StateService } from '../../src/endpoints/location/state.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { NotificationService } from '../../src/common/modules/notification/notification.service';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '../../src/secrets';

export function mockFunction(args) {} // eslint-disable-line

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
    findOneByOrFail: jest.fn((entity) => entity),
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
    count: jest.fn((entity) => entity),
    ping: jest.fn(),
  }));

export const mailerServiceMockFactory: () => MockType<MailerService> = jest.fn(
  () => ({
    sendMail: jest.fn((entity) => entity),
  }),
);

export const emailNotificationServiceMockFactory: () => MockType<EmailNotificationService> =
  jest.fn(() => ({
    insertEmailNotification: jest.fn(),
    getPendingLabRegisterNotification: jest.fn(),
    setEmailNotificationSent: jest.fn(),
  }));

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

export const debioConversionServiceMockFactory: () => MockType<DebioConversionService> =
  jest.fn(() => ({
    getExchange: jest.fn(),
  }));

export const transactionLoggingServiceMockFactory: () => MockType<TransactionLoggingService> =
  jest.fn(() => ({
    create: jest.fn(),
    updateHash: jest.fn(),
    getLoggingByOrderId: jest.fn(),
    getLoggingByHashAndStatus: jest.fn(),
  }));

export const escrowServiceMockFactory: () => MockType<EscrowService> = jest.fn(
  () => ({
    createOrder: jest.fn(),
    refundOrder: jest.fn(),
    cancelOrder: jest.fn(),
    orderFulfilled: jest.fn(),
    setOrderPaidWithSubstrate: jest.fn(),
    forwardPaymentToSeller: jest.fn(),
  }),
);

export const notificationServiceMockFactory: () => MockType<NotificationService> =
  jest.fn(() => ({
    insert: jest.fn(),
    getAllByToId: jest.fn(),
    setNotificationHasBeenReadById: jest.fn(),
    setBulkNotificationHasBeenRead: jest.fn(),
  }));

export function createMockOrder(status: OrderStatus) {
  const first_price = {
    component: 'string',
    value: 1,
  };
  const second_price = {
    component: 'string',
    value: 1,
  };

  return {
    toHuman: jest.fn(() => ({
      id: 'string',
      serviceId: 'string',
      customerId: 'string',
      customerBoxPublicKey: 'string',
      sellerId: 'string',
      dnaSampleTrackingId: 'string',
      currency: 'XX',
      prices: [first_price],
      additionalPrices: [second_price],
      status: status,
      orderFlow: '1',
      createdAt: '1',
      updatedAt: '1',
    })),
  };
}

export function createMockGeneticAnalysisOrder(
  status: GeneticAnalysisOrderStatus,
) {
  const first_price = {
    component: 'string',
    value: 1,
  };
  const second_price = {
    component: 'string',
    value: 1,
  };

  return {
    toHuman: jest.fn(() => ({
      id: 'string',
      serviceId: 'string',
      customerId: 'string',
      customerBoxPublicKey: 'string',
      sellerId: 'string',
      geneticDataId: 'string',
      geneticAnalysisTrackingId: 'string',
      currency: 'DBIO',
      prices: [first_price],
      additionalPrices: [second_price],
      status: status,
      orderFlow: '1',
      createdAt: '1',
      updatedAt: '1',
    })),
  };
}

export function createMockGeneticAnalyst(verificationStatus = 'string') {
  return {
    toHuman: jest.fn(() => ({
      accountId: 'string',
      services: [],
      qualifications: [],
      info: {
        firstName: 'string',
        lastName: 'string',
        gender: 'string',
        dateOfBirth: Date,
        email: 'string',
        phoneNumber: 'string',
        specialization: 'string',
        profileLink: 'string',
        profileImage: 'string',
      },
      stakeAmount: 1,
      stakeStatus: 'string',
      verificationStatus: verificationStatus,
    })),
  };
}

export function createMockLab() {
  return {
    toHuman: jest.fn(() => ({
      accountId: 'string',
      services: [],
      certifications: [],
      verificationStatus: 'string',
      info: {
        boxPublicKey: 'string',
        name: 'string',
        email: 'string',
        country: 'string',
        region: 'string',
        city: 'string',
        address: 'string',
        phoneNumber: 'string',
        website: 'string',
        latitude: 'string',
        longitude: 'string',
        profileImage: null,
      },
      stakeAmount: '50,000,000,000,000,000,000,000',
      stakeStatus: 'string',
      unstakeAt: 0,
      retrieveUnstakeAt: 0,
    })),
  };
}

export function createMockDnaSample() {
  return {
    toHuman: jest.fn(() => ({
      trackingId: 'string',
      labId: 'string',
      ownerId: 'string',
      status: 'Registered',
      orderId: 'string',
      rejectedTitle: 'string',
      rejectedDescription: 'string',
      createdAt: 0,
      updatedAt: 0,
    })),
  };
}

export function createMockGeneticAnalysis(status: GeneticAnalysisStatus) {
  return {
    toHuman: jest.fn(() => ({
      geneticAnalysisTrackingId: 'string',
      geneticAnalystId: 'string',
      ownerId: 'string',
      reportLink: 'string',
      comment: 'string',
      rejectedTitle: 'string',
      rejectedDescription: 'string',
      geneticAnalysisOrderId: 'string',
      createdAt: '1',
      updatedAt: '1',
      status: status,
    })),
  };
}

export function createMockGeneticAnalystService() {
  return {
    toHuman: jest.fn(() => ({
      id: 'string',
      ownerId: 'string',
      info: {
        name: 'string',
        pricesByCurrency: [
          {
            currency: 'string',
            totalPrice: 1,
            priceComponents: [
              {
                component: 'string',
                value: 1,
              },
            ],
            additionalPrices: [
              {
                component: 'string',
                value: 1,
              },
            ],
          },
        ],
        expectedDuration: {
          duration: 'string',
          durationType: 'string',
        },
        description: 'string',
        testResultSample: 'string',
      },
    })),
  };
}

export const MockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

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

export const countryServiceMockFactory: () => MockType<CountryService> =
  jest.fn(() => ({
    getAll: jest.fn(),
    getByIso2Code: jest.fn(),
  }));

export const schedulerRegistryMockFactory: () => MockType<SchedulerRegistry> =
  jest.fn(() => ({
    addInterval: jest.fn(),
  }));

export const googleSecretManagerServiceMockFactory: () => MockType<
  GCloudSecretManagerService<keyList>
> = jest.fn(() => ({
  loadSecrets: jest.fn((entity) => entity),
  getSecret: jest.fn((entity) => entity),
}));
