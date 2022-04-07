import { connectionRetries, setElasticsearchDummyCredentials } from './config';
import { Client } from '@elastic/elasticsearch';

async function initalElasticsearchConnection(): Promise<Client> {
  await new Promise((resolve) => setTimeout(resolve, 500));
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
  const client: Client = await connectionRetries(
    initalElasticsearchConnection,
    60,
  );
  console.log('debio-elasticsearch resolved! ✅');

  console.log('Beginning debio-elasticsearch migrations 🏇...');

  console.log('Injecting `Lab` into debio-elasticsearch 💉...');
  client.index({
    index: 'labs',
    refresh: 'wait_for',
    id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    body: {
      account_id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      services: [
        {
          country: 'ID',
          city: 'Denpasar',
          owner_id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          service_flow: 'RequestTest',
          id: '0x27ccd73b42cdf895bf0f48ae43f097313fd96c7286fe2a152b6919fd76f1e05e',
          region: 'BA',
          info: {
            image: '',
            dna_collection_process:
              'Blood Cells - Dried Blood Spot Collection Process',
            test_result_sample: 'https://ipfs.io/ipfs/tmp',
            prices_by_currency: [
              {
                total_price: '3,000,000,000,000,000,000',
                currency: 'DAI',
                price_components: [
                  {
                    component: 'testing_price',
                    value: '1,000,000,000,000,000,000',
                  },
                ],
                additional_prices: [
                  {
                    component: 'qc_price',
                    value: '2,000,000,000,000,000,000',
                  },
                ],
              },
            ],
            name: 'SG-BLOOD',
            expected_duration: {
              duration: '4',
              durationType: 'Days',
            },
            description: 'SG-BLOOD SHORT DESC',
            long_description: 'SG-BLOOD LONG DESC',
            category: 'Single Gene',
          },
        },
      ],
      services_ids: [
        '0x27ccd73b42cdf895bf0f48ae43f097313fd96c7286fe2a152b6919fd76f1e05e',
      ],
      certifications: [],
      certifications_ids: [],
      verification_status: 'Verified',
      info: {
        box_public_key:
          '0xc49a8b0f195bd05c6b5edd364ae43ff37c33edfbfeacd69ff097a7b9c3b39465',
        name: 'Bali Lab',
        email: 'syalala@gmail.com',
        phone_number: '2637490228',
        website: 'https://lab.dev.debio.network/lab/registration',
        country: 'ID',
        city: 'Denpasar',
        region: 'BA',
        address: 'denpasar bali',
        latitude: null,
        longitude: null,
        profile_image:
          'https://ipfs.io/ipfs/QmQyntJ9uCnmjwDh2AWujBQyb5K1QNob3cBDvrEScL5yHH/featured-lab.jpg',
      },
      blockMetaData: {
        blockNumber: 4147,
        blockHash:
          '0x75dff4eb85ded7e4c7319348ac5db1b09e7beafcb5905cf4e9f68e876c1fa5a7',
      },
    },
  });
  console.log('`Lab` data injection successful! ✅');

  console.log('Injecting `Service` into debio-elasticsearch 💉...');
  client.index({
    index: 'services',
    refresh: 'wait_for',
    id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    body: {
      id: '0xb7acb3b27d097d8956acf1384e14a2d846820052c45c3a12d7e58c5fa368f8bc',
      owner_id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      info: {
        prices_by_currency: [
          {
            currency: 'DAI',
            total_price: '2,000,000,000,000,000,000',
            price_components: [
              {
                component: 'testing_price',
                value: '1,000,000,000,000,000,000',
              },
            ],
            additional_prices: [
              {
                component: 'qc_price',
                value: '1,000,000,000,000,000,000',
              },
            ],
          },
        ],
        name: 'SNP-BUCCAL',
        expected_duration: {
          duration: '15',
          durationType: 'Hours',
        },
        category: 'SNP Microarray',
        description: 'SNP-BUCCAL SHORT DESC',
        dna_collection_process:
          'Epithelial Cells - Buccal Swab Collection Process',
        test_result_sample: 'https://ipfs.io/ipfs/tmp',
        long_description: 'SNP-BUCCAL LONG DESC',
        image: '',
      },
      country: 'ID',
      city: 'Denpasar',
      region: 'BA',
      blockMetaData: {
        blockNumber: 4173,
        blockHash:
          '0xc450616edc40c7c761204ca1e4fdf19aaf1585c8d40bc68bc7deb3d58ed99ea8',
      },
      service_flow: 'RequestTest',
    },
  });
  console.log('`Service` data injection successful! ✅');

  console.log('Injecting `Order` into debio-elasticsearch 💉...');
  client.index({
    index: 'orders',
    refresh: 'wait_for',
    id: '0xf310b59907c98e384a8528b324a0bd96b4e7361c7dfd943e40d3c7156632cf2c',
    body: {
      id: '0xf310b59907c98e384a8528b324a0bd96b4e7361c7dfd943e40d3c7156632cf2c',
      service_id:
        '0x27ccd73b42cdf895bf0f48ae43f097313fd96c7286fe2a152b6919fd76f1e05e',
      customer_id: '5Da5aHSoy3Bxb7Kxo4HuPLY7kE9FKxEg93dVhCKeXJ5JGY25',
      customer_box_public_key:
        '0x35aa27206bdb36f0e5cc892170ec3dd97630c86786be8cbbb71d6b0ebf76a832',
      seller_id: '5Hj284yPGCrxjh7CHw5o1CFJXKf1DYfgbYk6CPrm1pPyCiYM',
      dna_sample_tracking_id: 'QPDOIJUAB99YXYUF1EX00',
      currency: 'DAI',
      prices: {
        component: 'testing_price',
        value: '10000000000',
      },
      additional_prices: {
        component: 'qc_price',
        value: '10000000000',
      },
      status: 'Paid',
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      lab_info: {},
      service_info: {},
      order_flow: 'RequestTest',
      bounty: true,
    },
  });
  console.log('`Order` data injection successful! ✅');

  console.log('Injecting `Service Request` into debio-elasticsearch 💉...');
  client.index({
    index: 'create-service-request',
    refresh: 'wait_for',
    id: '0x22d03ae32b4c2dcca4f69c26f768aa160d9466f501bfb622e6d84c639e621fa9',
    body: {
      request: {
        hash: '0x22d03ae32b4c2dcca4f69c26f768aa160d9466f501bfb622e6d84c639e621fa9',
        requester_address: '5GH6Kqaz3ZewWvDCZPkTnsRezUf2Q7zZ5GmC4XFLNqKdVwA7',
        lab_address: null,
        country: 'ID',
        city: 'Kota Administrasi Jakarta Barat',
        region: 'JK',
        service_category: 'SNP Microarray',
        staking_amount: '5,000,000,000,000,000,000',
        status: 'Open',
        created_at: '1,648,627,710,001',
        updated_at: null,
        unstaked_at: null,
      },
      blockMetadata: {
        blockNumber: 16559,
        blockHash:
          '0x3f314d6ef05403a6a2edee59b67e1cc1b6b1053ee65d2ff6ff759bccd28c4d98',
      },
    },
  });
  console.log('`Service Request` data injection successful! ✅');

  await client.close();
  console.log('debio-elasticsearch migration successful! 🙌');
};
