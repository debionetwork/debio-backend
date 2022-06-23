import { connectionRetries, setElasticsearchDummyCredentials } from './config';
import { Client } from '@elastic/elasticsearch';

async function initalElasticsearchConnection(): Promise<Client> {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  setElasticsearchDummyCredentials();
  return new Client({
    node: process.env.ELASTICSEARCH_NODE,
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  });
}

module.exports = async () => {
  // Wait for Elasticsearch to open connection.
  console.log('Waiting for debio-elasticsearch to resolve ⏰...');
  await connectionRetries(initalElasticsearchConnection, 60);
  console.log('debio-elasticsearch resolved! ✅');
};
