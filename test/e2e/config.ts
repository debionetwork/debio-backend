const data: 'postgres' = 'postgres'; // eslint-disable-line
const pass = 'root';

export const dummyCredentials = {
  type: data,
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: pass,
};

export function setElasticsearchDummyCredentials() {
  process.env.ELASTICSEARCH_NODE = 'http://localhost:9200';
  process.env.ELASTICSEARCH_USERNAME = 'elastic';
  process.env.ELASTICSEARCH_PASSWORD = 'elastic';
}
