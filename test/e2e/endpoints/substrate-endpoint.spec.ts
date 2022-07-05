import request from 'supertest';
import 'regenerator-runtime/runtime';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeModule } from '../../../src/common/modules/proxies/date-time';
import { LocationModule } from '../../../src/endpoints/location/location.module';
import {
  DebioConversionModule,
  TransactionLoggingModule,
  SubstrateModule,
  SubstrateService,
} from '../../../src/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dummyCredentials } from '../config';
import { TransactionRequest } from '../../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { Country } from '../../../src/endpoints/location/models/country.entity';
import { State } from '../../../src/endpoints/location/models/state.entity';
import { City } from '../../../src/endpoints/location/models/city.entity';
import { SubstrateEndpointModule } from '../../../src/endpoints/substrate-endpoint/substrate-endpoint.module';
import { WalletBindingDTO } from '../../../src/endpoints/substrate-endpoint/dto/wallet-binding.dto';
import {
  createGeneticAnalysisOrder,
  GeneticAnalysisOrder,
  queryGeneticDataByOwnerId,
  queryGetAllGeneticAnalystServices,
  queryLastGeneticAnalysisOrderByCustomerId,
} from '@debionetwork/polkadot-provider';
import { GeneticAnalysisOrderPaidDto } from '../../../src/endpoints/substrate-endpoint/dto/genetic-analysis-order-paid.dto';
import { NotificationEndpointModule } from '../../../src/endpoints/notification-endpoint/notification-endpoint.module';
import {
  GCloudSecretManagerModule,
  GCloudSecretManagerService,
} from '@debionetwork/nestjs-gcloud-secret-manager';

describe('Substrate Endpoint Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;
  let substrateService: SubstrateService;

  const apiKey = 'DEBIO_API_KEY';

  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  class GoogleSecretManagerServiceMock {
    _secretsList = new Map<string, string>([
      ['ELASTICSEARCH_USERNAME', process.env.ELASTICSEARCH_USERNAME],
      ['ELASTICSEARCH_PASSWORD', process.env.ELASTICSEARCH_PASSWORD],
      ['ADMIN_SUBSTRATE_MNEMONIC', process.env.ADMIN_SUBSTRATE_MNEMONIC],
      ['DEBIO_API_KEY', process.env.DEBIO_API_KEY],
    ]);
    loadSecrets() {
      return null;
    }

    getSecret(key) {
      return this._secretsList.get(key);
    }
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SubstrateEndpointModule,
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [TransactionRequest],
          autoLoadEntities: true,
        }),
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          name: 'dbLocation',
          database: 'db_location',
          entities: [Country, State, City],
          autoLoadEntities: true,
        }),
        LocationModule,
        DebioConversionModule,
        ElasticsearchModule.registerAsync({
          imports: [GCloudSecretManagerModule],
          inject: [GCloudSecretManagerService],
          useFactory: async (
            gCloudSecretManagerService: GCloudSecretManagerService,
          ) => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: gCloudSecretManagerService
                .getSecret('ELASTICSEARCH_USERNAME')
                .toString(),
              password: gCloudSecretManagerService
                .getSecret('ELASTICSEARCH_PASSWORD')
                .toString(),
            },
          }),
        }),
        SubstrateModule,
        TransactionLoggingModule,
        DateTimeModule,
        NotificationEndpointModule,
      ],
    })
      .overrideProvider(GCloudSecretManagerService)
      .useClass(GoogleSecretManagerServiceMock)
      .compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    substrateService = module.get(SubstrateService);
    await app.init();
  });

  afterAll(async () => {
    await substrateService.stopListen();
    substrateService.destroy();
  });

  it('GET /substrate/labs: findByCountryCityCategory should return', async () => {
    // Arrange
    const COUNTRY = 'ID';
    const REGION = 'BA';
    const CITY = 'Denpasar';
    const CATEGORY = 'Single Gene';
    const SERVICE_FLOW = 'RequestTest';

    // Act
    const result = await request(server)
      .get(
        `/substrate/labs?country=${COUNTRY}&region=${REGION}&city=${CITY}&category=${CATEGORY}&service_flow=${SERVICE_FLOW}`,
      )
      .send();

    // Assert
    expect(result.text.includes(COUNTRY)).toBeTruthy();
    expect(result.text.includes(REGION)).toBeTruthy();
    expect(result.text.includes(CITY)).toBeTruthy();
    expect(result.text.includes(CATEGORY)).toBeTruthy();
    expect(result.text.includes(SERVICE_FLOW)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);

  it('GET /substrate/services: findByCountryCity should return', async () => {
    // Arrange
    const COUNTRY = 'ID';
    const CITY = 'Denpasar';

    // Act
    const result = await request(server)
      .get(`/substrate/services/${COUNTRY}/${CITY}`)
      .send();

    // Assert
    expect(result.text.includes(COUNTRY)).toBeTruthy();
    expect(result.text.includes(CITY)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);

  it('GET /substrate/countries: getAggregatedByCountries should return', async () => {
    // Arrange
    const COUNTRY = 'ID';
    const CITY = 'Kota Administrasi Jakarta Barat';

    // Act
    const result = await request(server).get(`/substrate/countries`).send();

    // Assert
    expect(result.text.includes(COUNTRY)).toBeTruthy();
    expect(result.text.includes(CITY)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);

  it('POST /substrate/wallet-binding: walletBinding should return', async () => {
    // Arrange
    const ACCOUNT_ID = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    const ETH_ADDRESS =
      '0xf5b6b9e7b3eb3dcd5b70df779fe3ef28ca4332c73d3fcbe9d6021863996bea75';
    const data: WalletBindingDTO = {
      role: 'Customer',
      accountId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      ethAddress:
        '0xf5b6b9e7b3eb3dcd5b70df779fe3ef28ca4332c73d3fcbe9d6021863996bea75',
    };

    // Act
    const result = await request(server)
      .post(`/substrate/wallet-binding`)
      .set('debio-api-key', apiKey)
      .send(data);

    // Assert
    expect(result.text.includes(ACCOUNT_ID)).toBeTruthy();
    expect(result.text.includes(ETH_ADDRESS)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 120000);

  it('GET /substrate/orders/{hash_id}: getOrderById should return', async () => {
    // Arrange
    const HASH_ID =
      '0xf310b59907c98e384a8528b324a0bd96b4e7361c7dfd943e40d3c7156632cf2c';

    // Act
    const result = await request(server)
      .get(`/substrate/orders/${HASH_ID}`)
      .send();

    // Assert
    expect(result.text.includes(HASH_ID)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);

  it('GET /substrate/orders/list/{customer_id}: getOrderByCustomer should return', async () => {
    // Arrange
    const CUSTOMER_ID = '5Da5aHSoy3Bxb7Kxo4HuPLY7kE9FKxEg93dVhCKeXJ5JGY25';

    // Act
    const result = await request(server)
      .get(`/substrate/orders/list/${CUSTOMER_ID}`)
      .send();

    // Assert
    expect(result.text.includes(CUSTOMER_ID)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);

  it('GET /substrate/orders/bounty_list/{customer_id}: getBountyByProductNameStatusLabName should return', async () => {
    // Arrange
    const CUSTOMER_ID = '5Da5aHSoy3Bxb7Kxo4HuPLY7kE9FKxEg93dVhCKeXJ5JGY25';

    // Act
    const result = await request(server)
      .get(`/substrate/orders/bounty_list/${CUSTOMER_ID}`)
      .send();

    // Assert
    expect(result.text.includes(CUSTOMER_ID)).toBeTruthy();
    expect(result.status).toEqual(200);
  });

  it('GET /substrate/orders/list/lab/{lab_id}: getOrderByLab should return', async () => {
    // Arrange
    const LAB_ID = '5Hj284yPGCrxjh7CHw5o1CFJXKf1DYfgbYk6CPrm1pPyCiYM';

    // Act
    const result = await request(server)
      .get(`/substrate/orders/list/lab/${LAB_ID}`)
      .send();

    // Assert
    expect(result.text.includes(LAB_ID)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);

  it('GET /substrate/service-request/{customer_id}', async () => {
    // Arrange
    const CUSTOMER_ID = '5GH6Kqaz3ZewWvDCZPkTnsRezUf2Q7zZ5GmC4XFLNqKdVwA7';

    // Act
    const result = await request(server)
      .get(`/substrate/service-request/${CUSTOMER_ID}`)
      .send();

    // Assert
    expect(result.text.includes(CUSTOMER_ID)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 15000);

  it('GET /substrate/provideRequestService: getCustomerProvidedService should return', async () => {
    // Arrange
    const COUNTRY_CODE = 'ID';
    const REGION_CODE = 'JK';
    const CITY = 'Kota Administrasi Jakarta Barat';
    const CATEGORY = 'SNP Microarray';

    // Act
    const result = await request(server)
      .get(`/substrate/provideRequestService`)
      .query({ countryCode: COUNTRY_CODE })
      .query({ regionCode: REGION_CODE })
      .query({ city: CITY })
      .query({ category: CATEGORY })
      .send();

    // Assert
    expect(result.text.includes(COUNTRY_CODE)).toBeTruthy();
    expect(result.text.includes(REGION_CODE)).toBeTruthy();
    expect(result.text.includes(CITY)).toBeTruthy();
    expect(result.text.includes(CATEGORY)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 15000);

  it('POST /substrate/geneticAnalysisOrderPaid: geneticAnalysisOrderPaid should return', async () => {
    // Arrange
    const customerBoxPublicKey =
      '0x8d2f0702072c07d31251be881104acde7953ecc1c8b33c31fce59ec6b0799ecc';
    const geneticData = (
      await queryGeneticDataByOwnerId(
        substrateService.api,
        substrateService.pair.address,
      )
    )[0];
    const geneticAnalystService = (
      await queryGetAllGeneticAnalystServices(substrateService.api)
    )[0];

    const geneticAnalysisOrderPromise: Promise<GeneticAnalysisOrder> =
      // eslint-disable-next-line
      new Promise((resolve, reject) => {
        createGeneticAnalysisOrder(
          substrateService.api,
          substrateService.pair,
          geneticData.id,
          geneticAnalystService.id,
          0,
          geneticData.reportLink,
          customerBoxPublicKey,
          () => {
            queryLastGeneticAnalysisOrderByCustomerId(
              substrateService.api,
              substrateService.pair.address,
            ).then((res) => {
              resolve(res);
            });
          },
        );
      });

    const geneticAnalysisOrder = await geneticAnalysisOrderPromise;
    expect(geneticAnalysisOrder.sellerId).toEqual(
      substrateService.pair.address,
    );
    expect(geneticAnalysisOrder.geneticDataId).toEqual(geneticData.id);
    expect(geneticAnalysisOrder.customerBoxPublicKey).toEqual(
      customerBoxPublicKey,
    );

    const data: GeneticAnalysisOrderPaidDto = {
      genetic_analysis_order_id: geneticAnalysisOrder.id,
    };

    // Act
    const result = await request(server)
      .post('/substrate/geneticAnalysisOrderPaid')
      .set('debio-api-key', apiKey)
      .send(data);

    // Assert
    expect(result.text.includes(data.genetic_analysis_order_id)).toBeTruthy();
    expect(result.status).toEqual(200);
  }, 30000);

  it('GET /substrate/genetic-analysis/{tracking_id}: getGeneticAnalysisByTrackingId should return', async () => {
    // Arrange
    const tracking_id = 'EKBZDLPMWE3CN32I10EKB';

    const result = await request(server)
      .get(`/substrate/genetic-analysis/${tracking_id}`)
      .send();

    expect(result.text.includes(tracking_id)).toBeTruthy();
    expect(result.status).toEqual(200);
  });

  it('GET /substrate/genetic-analysis-order/list/analyst/{analyst_id}: getGeneticAnalysisOrderByAnalyst should return', async () => {
    // Arrange
    const analyst_id = '5DcWiG6XUcBtoG9XRRoay3LRzGWATbNuWppYyPfeMDEYaeYN';

    const result = await request(server)
      .get(`/substrate/genetic-analysis-order/list/analyst/${analyst_id}`)
      .send();

    expect(result.text.includes(analyst_id)).toBeTruthy();
    expect(result.status).toEqual(200);
  });

  it('GET /substrate/genetic-analysis-order/list/customer/{customer_id}: getGeneticAnalysisOrderByCustomer should return', async () => {
    // Arrange
    const customer_id = '5Da5aHSoy3Bxb7Kxo4HuPLY7kE9FKxEg93dVhCKeXJ5JGY25';

    const result = await request(server)
      .get(`/substrate/genetic-analysis-order/list/customer/${customer_id}`)
      .send();

    expect(result.text.includes(customer_id)).toBeTruthy();
    expect(result.status).toEqual(200);
  });
});
