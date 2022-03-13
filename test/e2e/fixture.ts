import { createConnection } from "typeorm";
import { LabRating } from '../../src/endpoints/rating/models/rating.entity';
import { LocationEntities } from '../../src/endpoints/location/models';
import { TransactionRequest } from '../../src/common/modules/transaction-logging/models/transaction-request.entity';

module.exports = async () => {
  // Wait for database to open connection.
  await new Promise(resolve => setTimeout(resolve, 2000));

  const mainConnection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'postgres',
  });
  await mainConnection.query(`CREATE DATABASE db_postgres;`);
  await mainConnection.query(`CREATE DATABASE db_location;`);
  await mainConnection.close();
  
  const dbPostgresMigration = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'db_postgres',
    entities: [LabRating, TransactionRequest],
    synchronize: true,
  });
  await dbPostgresMigration.close();
  
  const dbLocationMigration = await createConnection({
    name: 'dbLocation',
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'db_location',
    entities: [...LocationEntities],
    synchronize: true,
  });
  await dbLocationMigration.close();
}
