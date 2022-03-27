import { setElasticsearchDummyCredentials } from './config';

module.exports = async () => {
  // Wait for Elasticsearch to open connection.
  console.log('Waiting for Elasticsearch connection to resolve ⏰...');
  setElasticsearchDummyCredentials();
  await new Promise((resolve) => setTimeout(resolve, 30000));
  console.log('Elasticsearch connection to resolved! ✅');
};
