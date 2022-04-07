import request from 'supertest';
import 'regenerator-runtime/runtime';
import { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTimeModule } from '../../../src/common/modules/proxies/date-time';
import { LocationModule } from '../../../src/endpoints/location/location.module';
import {
  DebioConversionModule,
  RewardModule,
  SubstrateModule,
  SubstrateService,
} from '../../../src/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dummyCredentials } from '../config';
import { Reward } from '../../../src/common/modules/reward/models/reward.entity';
import { Country } from '../../../src/endpoints/location/models/country.entity';
import { State } from '../../../src/endpoints/location/models/state.entity';
import { City } from '../../../src/endpoints/location/models/city.entity';
import { SubstrateEndpointModule } from '../../../src/endpoints/substrate-endpoint/substrate-endpoint.module';
import { WalletBindingDTO } from '../../../src/endpoints/substrate-endpoint/dto/wallet-binding.dto';
import { GeneticAnalysisOrderPaidDto } from '../../../src/endpoints/substrate-endpoint/dto/genetic-analysis-order-paid.dto';
import {
  GeneticAnalysisOrder,
  queryGeneticDataByOwnerId,
  queryLastGeneticAnalysisOrderByCustomerId,
  registerGeneticAnalyst,
} from '@debionetwork/polkadot-provider';

describe('Substrate Endpoint Controller (e2e)', () => {
  let server: Server;
  let app: INestApplication;
  let substrateService: SubstrateService;

  const apiKey = 'DEBIO_API_KEY';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SubstrateEndpointModule,
        TypeOrmModule.forRoot({
          ...dummyCredentials,
          database: 'db_postgres',
          entities: [Reward],
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
          useFactory: async () => ({
            node: process.env.ELASTICSEARCH_NODE,
            auth: {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD,
            },
          }),
        }),
        SubstrateModule,
        RewardModule,
        DateTimeModule,
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    substrateService = module.get(SubstrateService);
    await app.init();
  });

  afterAll(async () => {
    await substrateService.stopListen();
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
  }, 30000);

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
});
