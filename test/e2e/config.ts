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

export async function connectionRetries(
  func: () => Promise<any>,
  retries: number,
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await func();
    } catch {
      if (i == retries - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
