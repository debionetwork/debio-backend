import { dummyCredentials } from './config';
import { createConnection } from 'typeorm';
import { LabRating } from '../../src/endpoints/rating/models/rating.entity';
import { LocationEntities } from '../../src/endpoints/location/models';
import { TransactionRequest } from '../../src/common/modules/transaction-logging/models/transaction-request.entity';
import { DataStakingEvents } from '../../src/endpoints/bounty/models/data-staking-events.entity';
import { DataTokenToDatasetMapping } from '../../src/endpoints/bounty/models/data-token-to-dataset-mapping.entity';

module.exports = async () => {
  // Wait for database to open connection.
  console.log('Waiting for database connection to resolve ⏰...');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log('Database connection to resolved! ✅');

  const mainConnection = await createConnection({
    ...dummyCredentials,
    database: 'postgres',
  });
  await mainConnection.query(`CREATE DATABASE db_postgres;`);
  await mainConnection.query(`CREATE DATABASE db_location;`);
  await mainConnection.close();

  const dbPostgresMigration = await createConnection({
    ...dummyCredentials,
    database: 'db_postgres',
    entities: [
      LabRating,
      TransactionRequest,
      DataStakingEvents,
      DataTokenToDatasetMapping,
    ],
    synchronize: true,
  });
  await dbPostgresMigration.close();

  const dbLocationMigration = await createConnection({
    name: 'dbLocation',
    ...dummyCredentials,
    database: 'db_location',
    entities: [...LocationEntities],
    synchronize: true,
  });
  await dbLocationMigration.close();
};
