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
  await client.index({
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

  await client.index({
    index: 'labs',
    refresh: 'wait_for',
    id: '5DAsjPuMX8HD4LtA3fpxMydJuUXShS9JB1hYh4PS1QRBw5yv',
    body: {
      account_id: '5DAsjPuMX8HD4LtA3fpxMydJuUXShS9JB1hYh4PS1QRBw5yv',
      services: [
        {
          country: 'MY',
          city: 'Johor Bahru',
          owner_id: '5DAsjPuMX8HD4LtA3fpxMydJuUXShS9JB1hYh4PS1QRBw5yv',
          service_flow: 'RequestTest',
          id: '0xd7a18df31d8bf92679aaaec23fca1a7f1fcc3027ce741a2575d04ea4e67ddcd9',
          region: '01',
          info: {
            image:
              'https://ipfs.io/ipfs/QmcVYqPKp9ztSJ8TKqKY4gCDWtf4yPw712EdVQGwBhASMQ',
            dna_collection_process:
              'Epithelial Cells - Buccal Swab Collection Process',
            test_result_sample: 'dummy test result sample',
            prices_by_currency: [
              {
                total_price: '20,000,000,000,000,000,000',
                currency: 'DAI',
                price_components: [
                  {
                    component: 'testing_price',
                    value: '15,000,000,000,000,000,000',
                  },
                ],
                additional_prices: [
                  {
                    component: 'qc_price',
                    value: '5,000,000,000,000,000,000',
                  },
                ],
              },
            ],
            name: 'Whole Genome Sequencing',
            expected_duration: {
              duration: '7',
              durationType: 'WorkingDays',
            },
            description:
              'Analyze your entire genomic DNA sequence. Genomic information has been instrumental in identifying inherited disorders, characterizing the mutations that drive cancer progression, and tracking disease outbreaks.',
            long_description: 'SG-BLOOD LONG DESC',
            category: 'Whole Genome Sequencing',
          },
        },
      ],
      services_ids: [
        '0xd7a18df31d8bf92679aaaec23fca1a7f1fcc3027ce741a2575d04ea4e67ddcd9',
      ],
      certifications: [],
      certifications_ids: [],
      verification_status: 'Verified',
      info: {
        box_public_key:
          '0x6684ce5f03f06808a5dd7abb5367a1b65a2fdc9c6b4de5aae3ebc2768eba0663',
        name: 'International Bioscience',
        email: 'info@ibdna.com.my',
        phone_number: '+608873187647186',
        website: 'inter-bio.com',
        country: 'MY',
        city: 'Johor Bahru',
        region: '01',
        address: 'Johor',
        latitude: null,
        longitude: null,
        profile_image:
          'https://ipfs.io/ipfs/QmQyntJ9uCnmjwDh2AWujBQyb5K1QNob3cBDvrEScL5yHH/featured-lab.jpg',
      },
      stake_amount: 10000000,
      stake_status: 'WaitingForUnstaked',
      unstake_at: new Date(),
      retrieve_unstake_at: new Date(),
      block_meta_data: {
        blockNumber: 4147,
        blockHash:
          '0x75dff4eb85ded7e4c7319348ac5db1b09e7beafcb5905cf4e9f68e876c1fa5a7',
      },
    },
  });
  console.log('`Lab` data injection successful! ✅');

  console.log('Injecting `Service` into debio-elasticsearch 💉...');
  await client.index({
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

  console.log('Injecting `Genetic Analysis` into debio-elasticsearch 💉...');
  await client.index({
    index: 'genetic-analysis',
    refresh: 'wait_for',
    id: '5DcWiG6XUcBtoG9XRRoay3LRzGWATbNuWppYyPfeMDEYaeYN',
    body: {
      genetic_analysis_tracking_id: 'EKBZDLPMWE3CN32I10EKB',
      genetic_analyst_id: '5DcWiG6XUcBtoG9XRRoay3LRzGWATbNuWppYyPfeMDEYaeYN',
      owner_id: '5GH6Kqaz3ZewWvDCZPkTnsRezUf2Q7zZ5GmC4XFLNqKdVwA7',
      report_link: 'aaaa',
      comment: null,
      rejected_title: 'asda',
      rejected_description: 'asd',
      genetic_analysis_order_id:
        '0xd6420ba31954878047a9965bfd086bca23fb3cd91ac2ee61fbb0da50b17a8805',
      created_at: '1,649,665,128,000',
      updated_at: '1,649,840,004,002',
      status: 'Rejected',
      blockMetaData: {
        blockNumber: 218547,
        blockHash:
          '0xd56def3b447f82eb90998cfd832ba3f163a25d2b445df757b5103d975078a7ec',
      },
    },
  });
  console.log('`Genetic Analysis` data injection successful! ✅');
  console.log(
    'Injecting `Genetic Analysis Order` into debio-elasticsearch 💉...',
  );
  await client.index({
    index: 'genetic-analysis-order',
    refresh: 'wait_for',
    id: '0x104c82003294b88166fbe457555eaa06c88ad3b16e36a38d45ea4b995147869a',
    body: {
      id: '0x104c82003294b88166fbe457555eaa06c88ad3b16e36a38d45ea4b995147869a',
      service_id:
        '0x5987bcd4132c89dcefd0258e10138a2374a6cc4175d89cc0afb5b06971671a37',
      customer_id: '5EHVBjYUsmfDRR78xF6m1eecDfYbbRyxD7A5XtdBHSu1U21s',
      customer_box_public_key:
        '0x95ff54809b0022e56bf1882978bb73dce92ee0a3bd4b83044ac813258020325b',
      seller_id: '5EhoT3BgTm1C9tfFstAfkTGHZABXa5CRj6QWdZtjBovYcyy3',
      genetic_data_id:
        '0xda63274bf57788e86469af04cdbc84c24427a8ee67bb4285247f4815507fab38',
      genetic_analysis_tracking_id: 'FSWPWI0S4UQKZCK3MWDN2',
      currency: 'DBIO',
      prices: [
        {
          component: 'dbio',
          value: '5,000,000,000,000,000,000',
        },
      ],
      additional_prices: [],
      status: 'Unpaid',
      created_at: '1,649,646,486,001',
      updated_at: '0',
      service_info: {
        name: 'diet service',
        prices_by_currency: [
          {
            currency: 'DBIO',
            total_price: '5,000,000,000,000,000,000',
            price_components: [
              {
                component: 'dbio',
                value: '5,000,000,000,000,000,000',
              },
            ],
            additional_prices: [],
          },
        ],
        expected_duration: {
          duration: '10',
          duration_type: 'WorkingDays',
        },
        description: 'string',
        test_result_sample: 'string',
      },
      genetic_analyst_info: {
        first_name: 'Park',
        last_name: 'Sungjin',
        gender: 'male',
        date_of_birth: '1,993',
        email: 'bobsungjin@gmail.com',
        phone_number: '083895969837',
        specialization: 'metabolic',
        profile_link: 'https://www.linkedin.com/in/cinia-eleonora/',
        profile_image: null,
      },
      blockMetaData: {
        blockNumber: 186294,
        blockHash:
          '0x267e8690d82d18b8efbf41b6e185f6f08d0ae2b9900b119f99807ff1de8e2391',
      },
    },
  });

  await client.index({
    index: 'genetic-analysis-order',
    refresh: 'wait_for',
    id: '0x3a8733f1694e5403bfd7a34298253e26037a9ac5fc6ea60b43438d81a2d58dd9',
    body: {
      id: '0x3a8733f1694e5403bfd7a34298253e26037a9ac5fc6ea60b43438d81a2d58dd9',
      service_id:
        '0x0a05afe158bc0766c4a8f755a8e02e7dc456bbad64e01aed248f59c0bbf314d3',
      customer_id: '5Da5aHSoy3Bxb7Kxo4HuPLY7kE9FKxEg93dVhCKeXJ5JGY25',
      customer_box_public_key:
        '0x95ff54809b0022e56bf1882978bb73dce92ee0a3bd4b83044ac813258020325b',
      seller_id: '5DcWiG6XUcBtoG9XRRoay3LRzGWATbNuWppYyPfeMDEYaeYN',
      genetic_data_id:
        '0x4c981b074d9380417ebf8fb90289500fceca23c05ed114488feb1f693dbb0132',
      genetic_analysis_tracking_id: 'LINKV5TA3OGAQC4IUU10L',
      currency: 'DBIO',
      prices: [
        {
          component: 'analyze_price',
          value: '10,000,000,000,000,000,000',
        },
      ],
      additional_prices: [],
      status: 'Paid',
      created_at: '1,649,264,352,001',
      updated_at: '0',
      service_info: {
        name: 'A Genome Services',
        prices_by_currency: [
          {
            currency: 'DBIO',
            total_price: '10,000,000,000,000,000,000',
            price_components: [
              {
                component: 'analyze_price',
                value: '10,000,000,000,000,000,000',
              },
            ],
            additional_prices: [],
          },
        ],
        expected_duration: {
          duration: '4',
          duration_type: 'Days',
        },
        description: 'string',
        test_result_sample: 'string',
      },
      genetic_analyst_info: {
        first_name: 'Harry James',
        last_name: 'Potter',
        gender: 'male',
        date_of_birth: '473,385,600,000',
        email: 'harry@potter.com',
        phone_number: '083895969837',
        specialization: 'Personalized medicine',
        profile_link: 'https://www.linkedin.com/in/cinia-eleonora/',
        profile_image: null,
      },
      blockMetaData: {
        blockNumber: 122629,
        blockHash:
          '0xb544187b024fdc39dd8bae55474120c2fcaee72638a4a6b879398faf59683b1a',
      },
    },
  });
  console.log('`Genetic Analysis Order` data injection successful! ✅');

  console.log('Injecting `Order` into debio-elasticsearch 💉...');
  await client.index({
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

  await client.index({
    index: 'orders',
    refresh: 'wait_for',
    id: '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
    body: {
      id: '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
      service_id:
        '0xb7acb3b27d097d8956acf1384e14a2d846820052c45c3a12d7e58c5fa368f8bc',
      customer_id:
        '0xb7acb3b27d097d8956acf1384e14a2d846820052c45c3a12d7e58c5fa368f8bc',
      customer_box_public_key:
        '0xb7acb3b27d097d8956acf1384e14a2d846820052c45c3a12d7e58c5fa368f8bc',
      seller_id:
        '0xb7acb3b27d097d8956acf1384e14a2d846820052c45c3a12d7e58c5fa368f8bc',
      dna_sample_tracking_id:
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      currency: 'DAI',
      prices: {
        component: 'test',
        value: '10000000000',
      },
      additional_prices: {
        component: 'test',
        value: '10000000000',
      },
      status: 'Fulfilled',
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      lab_info: {},
      service_info: {},
      order_flow: 'StakingRequestService',
    },
  });

  await client.index({
    index: 'orders',
    refresh: 'wait_for',
    id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    body: {
      id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      service_id:
        '0x27ccd73b42cdf895bf0f48ae43f097313fd96c7286fe2a152b6919fd76f1e05e',
      customer_id: '5Da5aHSoy3Bxb7Kxo4HuPLY7kE9FKxEg93dVhCKeXJ5JGY25',
      customer_box_public_key:
        '0x35aa27206bdb36f0e5cc892170ec3dd97630c86786be8cbbb71d6b0ebf76a832',
      seller_id:
        '0xb7acb3b27d097d8956acf1384e14a2d846820052c45c3a12d7e58c5fa368f8bc',
      transaction_hash:
        '0x85a0773882a27912211db04482865b8dfae7d9e31c1cd6d15899ba47b3c30d1e',
      dna_sample_tracking_id:
        '5FjqD9WgAS3DvxuZYNT7LX8jpPca3yfQXMWMtkmvN8kvFaSs',
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
  await client.index({
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

  await client.index({
    index: 'create-service-request',
    refresh: 'wait_for',
    id: '0x8b48ead7cf44e6449cbb5de298f3c3915f09b700b7a74b27a368c69629884155',
    body: {
      request: {
        hash: '0x8b48ead7cf44e6449cbb5de298f3c3915f09b700b7a74b27a368c69629884155',
        requester_address: '5GH6Kqaz3ZewWvDCZPkTnsRezUf2Q7zZ5GmC4XFLNqKdVwA7',
        lab_address: null,
        country: 'ID',
        city: 'Kota Administrasi Jakarta Barat',
        region: 'JK',
        service_category: 'SNP Microarray',
        staking_amount: '5,000,000,000,000,000,000',
        status: 'WaitingForUnstaked',
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
