import { connectionRetries, dummyCredentials } from './config';
import { Connection, createConnection } from 'typeorm';
import { LabRating } from '../../src/endpoints/rating/models/rating.entity';
import { LocationEntities } from '../../src/endpoints/location/models';
import { TransactionRequest } from '../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { DataStakingEvents } from '../../src/endpoints/bounty/models/data-staking-events.entity';
import { DataTokenToDatasetMapping } from '../../src/endpoints/bounty/models/data-token-to-dataset-mapping.entity';
import { EmailNotification } from '../../src/common/modules/database/email-notification';
import { Country } from '../../src/endpoints/location/models/country.entity';
import { State } from '../../src/endpoints/location/models/state.entity';
import { City } from '../../src/endpoints/location/models/city.entity';
import { EmrCategory } from '../../src/endpoints/category/emr/models/emr.entity';
import { ServiceCategory } from '../../src/endpoints/category/service/models/service-category.service';
import { SpecializationCategory } from '../../src/endpoints/category/specialization/models/specialization.entity';
import { DnaCollectionCategory } from '../../src/endpoints/category/dna-collection/models/dna-collection.entity';
import { emrList } from './endpoints/category/emr.mock.data';
import { serviceList } from './endpoints/category/service.mock.data';
import { specializationList } from './endpoints/category/specialization.mock.data';
import { Notification } from '../../src/common/modules/notification/models/notification.entity';
import { dnaCollectionList } from './endpoints/category/dna-collection.mock.data';
import { TransactionStatus } from '../../src/common/modules/transaction-status/models/transaction-status.entity';
import { TransactionType } from '../../src/common/modules/transaction-type/models/transaction-type.entity';
import { TransactionTypeList } from '../../src/common/modules/transaction-type/models/transaction-type.list';
import { TransactionStatusList } from '../../src/common/modules/transaction-status/models/transaction-status.list';

function initalPostgresConnection(): Promise<Connection> {
  return createConnection({
    ...dummyCredentials,
    database: 'postgres',
  });
}

module.exports = async () => {
  // Wait for database to open connection.
  console.log('Waiting for debio-postgres to resolve ⏰...');
  const mainConnection: Connection = await connectionRetries(
    initalPostgresConnection,
    40,
  );
  console.log('debio-postgres resolved! ✅');

  console.log('Building databases 🏗️...');
  await mainConnection.query(`CREATE DATABASE db_postgres;`);
  await mainConnection.query(`CREATE DATABASE db_location;`);
  await mainConnection.close();
  console.log('Database created successfully! 🏢');

  console.log('Beginning `db_postgres` migrations 🏇...');
  const dbPostgresMigration = await createConnection({
    ...dummyCredentials,
    database: 'db_postgres',
    entities: [
      LabRating,
      TransactionRequest,
      DataStakingEvents,
      DataTokenToDatasetMapping,
      EmailNotification,
      EmrCategory,
      ServiceCategory,
      SpecializationCategory,
      DnaCollectionCategory,
      Notification,
      TransactionStatus,
      TransactionType,
    ],
    synchronize: true,
  });

  console.log('Injecting `EMR Category` into debio-postgres 💉...');

  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(EmrCategory)
    .values(emrList)
    .execute();
  console.log('`EMR Category` data injection successful! ✅');

  console.log('Injecting `Service Category` into debio-postgres 💉...');
  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(ServiceCategory)
    .values(serviceList)
    .execute();
  console.log('`EMR Category` data injection successful! ✅');

  console.log('Injecting `Specialization Category` into debio-postgres 💉...');

  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(SpecializationCategory)
    .values(specializationList)
    .execute();
  console.log('`Specialization Category` data injection successful! ✅');

  console.log(
    'Injecting `DNA Collection Process Category` into debio-postgres 💉...',
  );

  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(DnaCollectionCategory)
    .values(dnaCollectionList)
    .execute();
  console.log('`EMR Category` data injection successful! ✅');

  console.log('Injecting `DNA Collection Process` into debio-postgres 💉...');

  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(TransactionRequest)
    .values({
      id: BigInt(1),
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      currency: 'DBIO',
      transaction_type: 4,
      amount: 50000,
      transaction_status: 20,
      created_at: new Date(),
      ref_number: '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
      parent_id: BigInt(0).toString(),
      transaction_hash: '',
    })
    .execute();
  console.log('`Transaction Log` data injection successful! ✅');

  console.log('Injecting `EmailNotification` into debio-postgres 💉...');
  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(EmailNotification)
    .values({
      ref_number: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      notification_type: 'LabRegister',
      is_email_sent: false,
      created_at: new Date(),
      sent_at: new Date(),
    })
    .execute();
  console.log('`EmailNotification` data injection successful! ✅');

  console.log('Injecting `Notification` into debio-postgres 💉...');
  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(Notification)
    .values({
      id: 1,
      role: 'Lab',
      entity: 'New Order',
      entity_type: 'Lab',
      reference_id: '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
      description: 'A new order ([]) is awaiting process.',
      read: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      from: 'Debio Network',
      to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      block_number: '1',
    })
    .execute();

  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(Notification)
    .values({
      id: 2,
      role: 'Lab',
      entity: 'New Order',
      entity_type: 'Lab',
      reference_id: '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
      description: 'A new order ([]) is awaiting process.',
      read: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      from: 'Debio Network',
      to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      block_number: '2',
    })
    .execute();

  await dbPostgresMigration
    .createQueryBuilder()
    .insert()
    .into(Notification)
    .values({
      id: 3,
      role: 'Lab',
      entity: 'New Order',
      entity_type: 'Lab',
      reference_id: '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
      description: 'A new order ([]) is awaiting process.',
      read: false,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      from: 'Debio Network',
      to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      block_number: '3',
    })
    .execute();
  console.log('`NOtification` data injection successful! ✅');

  console.log('Injecting `Transaction Type` into debio-postgres 💉...');

  const transactionTypes = [
    {
      id: 1,
      type: 'Order',
    },
    {
      id: 2,
      type: 'Staking Request Service',
    },
    {
      id: 3,
      type: 'Genetic Analysis Order',
    },
    {
      id: 4,
      type: 'Genetic Analyst',
    },
    {
      id: 5,
      type: 'Staking Genetic Analyst',
    },
    {
      id: 6,
      type: 'Staking Lab',
    },
    {
      id: 7,
      type: 'Lab',
    },
    {
      id: 8,
      type: 'Reward',
    },
  ];

  for (const transactionType of transactionTypes) {
    await dbPostgresMigration
      .createQueryBuilder()
      .insert()
      .into(TransactionType)
      .values({
        id: transactionType.id,
        type: transactionType.type as TransactionTypeList,
      })
      .execute();
  }
  console.log('`Transaction Type` data injection successful! ✅');

  console.log('Injecting `Transaction Status` into debio-postgres 💉...');

  const transactionStatus = [
    {
      id: 1,
      id_type: 1,
      transaction_status: 'Unpaid',
    },
    {
      id: 2,
      id_type: 1,
      transaction_status: 'Paid',
    },
    {
      id: 3,
      id_type: 1,
      transaction_status: 'Fulfilled',
    },
    {
      id: 4,
      id_type: 1,
      transaction_status: 'Refunded',
    },
    {
      id: 5,
      id_type: 1,
      transaction_status: 'Cancelled',
    },
    {
      id: 6,
      id_type: 1,
      transaction_status: 'Failed',
    },
    {
      id: 7,
      id_type: 2,
      transaction_status: 'Stake',
    },
    {
      id: 8,
      id_type: 2,
      transaction_status: 'Unstake',
    },
    {
      id: 9,
      id_type: 2,
      transaction_status: 'Excess',
    },
    {
      id: 10,
      id_type: 2,
      transaction_status: 'Partial',
    },
    {
      id: 11,
      id_type: 2,
      transaction_status: 'Waiting For Unstake',
    },
    {
      id: 12,
      id_type: 2,
      transaction_status: 'Finalized',
    },
    {
      id: 13,
      id_type: 3,
      transaction_status: 'Unpaid',
    },
    {
      id: 14,
      id_type: 3,
      transaction_status: 'Paid',
    },
    {
      id: 15,
      id_type: 3,
      transaction_status: 'Fulfilled',
    },
    {
      id: 16,
      id_type: 3,
      transaction_status: 'Refunded',
    },
    {
      id: 17,
      id_type: 3,
      transaction_status: 'Cancelled',
    },
    {
      id: 18,
      id_type: 3,
      transaction_status: 'Failed',
    },
    {
      id: 19,
      id_type: 4,
      transaction_status: 'Unverified',
    },
    {
      id: 20,
      id_type: 4,
      transaction_status: 'Verified',
    },
    {
      id: 21,
      id_type: 4,
      transaction_status: 'Rejected',
    },
    {
      id: 22,
      id_type: 4,
      transaction_status: 'Revoked',
    },
    {
      id: 23,
      id_type: 5,
      transaction_status: 'Staked',
    },
    {
      id: 24,
      id_type: 5,
      transaction_status: 'Unstaked',
    },
    {
      id: 25,
      id_type: 6,
      transaction_status: 'Unstaked',
    },
    {
      id: 26,
      id_type: 6,
      transaction_status: 'Staked',
    },
    {
      id: 27,
      id_type: 6,
      transaction_status: 'Waiting For Unstaked',
    },
    {
      id: 28,
      id_type: 7,
      transaction_status: 'Unverified',
    },
    {
      id: 29,
      id_type: 7,
      transaction_status: 'Verified',
    },
    {
      id: 30,
      id_type: 7,
      transaction_status: 'Rejected',
    },
    {
      id: 31,
      id_type: 7,
      transaction_status: 'Revoked',
    },
    {
      id: 32,
      id_type: 3,
      transaction_status: 'Service Charge',
    },
    {
      id: 33,
      id_type: 8,
      transaction_status: 'Registered User',
    },
    {
      id: 34,
      id_type: 8,
      transaction_status: 'Customer Add Data as Bounty',
    },
    {
      id: 35,
      id_type: 8,
      transaction_status: 'Lab Verified',
    },
    {
      id: 36,
      id_type: 8,
      transaction_status: 'Customer Stake Request Service',
    },
    {
      id: 37,
      id_type: 8,
      transaction_status: 'Lab Provide Requested Service',
    },
  ];

  for (const transactionStat of transactionStatus) {
    await dbPostgresMigration
      .createQueryBuilder()
      .insert()
      .into(TransactionStatus)
      .values({
        id: transactionStat.id,
        id_type: transactionStat.id_type,
        transaction_status:
          transactionStat.transaction_status as TransactionStatusList,
      })
      .execute();
  }
  console.log('`Transaction Status` data injection successful! ✅');

  await dbPostgresMigration.close();
  console.log('`db_postgres` migration successful! 🙌');

  console.log('Beginning `db_location` migrations 🏇...');
  const dbLocationMigration = await createConnection({
    name: 'dbLocation',
    ...dummyCredentials,
    database: 'db_location',
    entities: [...LocationEntities],
    synchronize: true,
  });

  console.log('Injecting `Country` into debio-postgres 💉...');
  await dbLocationMigration
    .createQueryBuilder()
    .insert()
    .into(Country)
    .values({
      id: 15,
      name: 'Burkina Faso',
      region: 'Africa',
      subregion: 'Western Africa',
      iso3: 'BFA',
      iso2: 'BF',
      latitude: 13.0,
      longitude: -2.0,
      numeric_code: 854,
      phone_code: '226',
      capital: 'Ouagadougou',
      currency: 'XOF',
      currency_symbol: 'CFA',
      tld: '.bf',
      native: 'Burkina Faso',
      timezones:
        '[{zoneName:"Africa/Ouagadougou",gmtOffset:0,gmtOffsetName:"UTCu00b100",abbreviation:"GMT",tzName:"Greenwich Mean Time"}]',
      emoji: '🇧🇫',
      emojiu: 'U+1F1E7 U+1F1EB',
    })
    .execute();
  console.log('`Country` data injection successful! ✅');

  console.log('Injecting `State` into debio-postgres 💉...');
  await dbLocationMigration
    .createQueryBuilder()
    .insert()
    .into(State)
    .values({
      id: 15,
      name: 'Carinthia',
      country_id: 15,
      country_code: 'AT',
      state_code: '2',
      latitude: 47.1537165,
      longitude: 16.2688797,
    })
    .execute();
  console.log('`State` data injection successful! ✅');

  console.log('Injecting `City` into debio-postgres 💉...');
  await dbLocationMigration
    .createQueryBuilder()
    .insert()
    .into(City)
    .values({
      id: 1,
      name: 'Warmbad-Judendorf',
      state_id: 2057,
      state_code: '2',
      country_id: 15,
      country_code: 'AT',
      latitude: 46.60126,
      longitude: 13.82241,
    })
    .execute();
  console.log('`City` data injection successful! ✅');

  await dbLocationMigration.close();
  console.log('`db_location` migration successful! 🙌');
};
