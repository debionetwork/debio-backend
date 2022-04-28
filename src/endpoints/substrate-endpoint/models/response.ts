export const labsResponse = {
  result: [
    {
      country: "ID",
      blockMetaData: {
        blockHash: "0x00...",
        blockNumber: 1
      },
      city: "Kota Tangerang",
      owner_id: "5HguA...",
      service_flow: "RequestTest",
      id: "0xe1b8...",
      region: "BT",
      info: {
        image: "https://g...",
        dna_collection_process: "Fecal Matters - Stool Collection Process",
        test_result_sample: "https://...",
        prices_by_currency: [
          {
            total_price: "2",
            currency: "DAI",
            price_components: [
              {
                component: "testing_price",
                value: "1"
              }
            ],
            additional_prices: [
              {
                component: "qc_price",
                value: "1"
              }
            ]
          }
        ],
        name: "SG Feccal",
        expected_duration: {
          duration: "28",
          durationType: "WorkingDays"
        },
        description: "short SG FECCAL",
        long_description: "LONG SG FECCAL",
        category: "Single Gene"
      },
      lab_detail: {
        country: "ID",
        website: "https://...",
        profile_image: "https://...",
        address: "Tangerang",
        city: "Kota Tangerang",
        latitude: null,
        name: "Tangerang Lab",
        phone_number: "1253637381",
        region: "BT",
        box_public_key: "0xf50...7",
        email: "bhdchdjwcb@gmail.com",
        longitude: null
      },
      certifications: [],
      verification_status: "Verified",
      lab_id: "5HguAcg2..."
    },
  ]
}

export const serviceByLocation = [
  {
    _index: "services",
    _id: "0xabd8...",
    _score: 0,
    _source: {
      id: "0xabd8...",
      owner_id: "5EFb...",
      info: {
        prices_by_currency: [
          {
            currency: "DAI",
            total_price: "20",
            price_components: [
              {
                component: "testing_price",
                value: "15"
              }
            ],
            additional_prices: [
              {
                component: "qc_price",
                value: "5"
              }
            ]
          }
        ],
        name: "Whole Genome Sequencing",
        expected_duration: {
          duration: "7",
          durationType: "WorkingDays"
        },
        category: "Whole Genome Sequencing",
        description: "Analyze your ...",
        dna_collection_process: "Epithelial Cells - Buccal Swab Collection Process",
        test_result_sample: "dummy test result sample",
        long_description: null,
        image: "https://...."
      },
      country: "ID",
      city: "Kota Administrasi Jakarta Timur",
      region: "JK",
      blockMetaData: {
        blockNumber: 471,
        blockHash: "0x2f64..."
      },
      service_flow: "RequestTest"
    }
  },
]

export const orderByHash = {
  id: "0xf310...",
  service_id: "0x27cc...",
  customer_id: "5Da5a...",
  customer_box_public_key: "0x35aa27...",
  seller_id: "5Hj28...",
  dna_sample_tracking_id: "QPDO...",
  currency: "DAI",
  prices: [
    {
      component: "testing_price",
      value: "2"
    }
  ],
  additional_prices: [
    {
      component: "qc_price",
      value: "1"
    }
  ],
  status: "Paid",
  created_at: "1,648,776,606,000",
  updated_at: "1,648,776,630,000",
  lab_info: {
    box_public_key: "0xc49...",
    name: "Bali Lab",
    email: "bjhsxbsajn@gmail.com",
    phone_number: "...",
    website: "https://...",
    country: "ID",
    city: "Denpasar",
    region: "BA",
    address: "bali",
    latitude: null,
    longitude: null,
    profile_image: "https://..."
  },
  service_info: {
    prices_by_currency: [
      {
        currency: "DAI",
        total_price: "3",
        price_components: [
          {
            component: "testing_price",
            value: "2"
          }
        ],
        additional_prices: [
          {
            component: "qc_price",
            value: "1"
          }
        ]
      }
    ],
    name: "SG-Blood",
    expected_duration: {
      duration: "5",
      durationType: "Days"
    },
    category: "Single Gene",
    description: "short desc SG",
    dna_collection_process: "Blood Cells - Dried Blood Spot Collection Process",
    test_result_sample: "https://...",
    long_description: "long desc SG",
    image: "https://..."
  },
  order_flow: "RequestTest",
  blockMetaData: {
    blockNumber: 1,
    blockHash: "0x98fa8..."
  },
  transaction_hash: "0x8e88..."
}

export const orderByCustomerId = {
  orders: {
    info: {
      page: 1,
      count: 33,
    },
    data: [
      {
        _index: "orders",
        _id: "0xb3e7e5...",
        _score: null,
        _source: {
          id: "0xb3e7e5...",
          service_id: "0x0052...",
          customer_id: "5Da5...",
          customer_box_public_key: "0x35aa2...",
          seller_id: "5Gv9...",
          dna_sample_tracking_id: "OEV...",
          currency: "DAI",
          prices: [
            {
              component: "testing_price",
              value: "2"
            }
          ],
          additional_prices: [
            {
              component: "qc_price",
              value: "2"
            }
          ],
          status: "Fulfilled",
          created_at: "1,651,052,970,001",
          updated_at: "1,651,053,216,000",
          lab_info: {
            box_public_key: "0xc49c98...",
            name: "singapur lab",
            email: "hjbasjq@gmail.com",
            phone_number: "7299163738",
            website: "https:/...",
            country: "SG",
            city: "Bishan",
            region: "01",
            address: "bishan, singapore",
            latitude: null,
            longitude: null,
            profile_image: "https://..."
          },
          service_info: {
            prices_by_currency: [
              {
                total_price: "4",
                currency: "DAI",
                price_components: [
                  {
                    component: "testing_price",
                    value: "2"
                  }
                ],
                additional_prices: [
                  {
                    component: "qc_price",
                    value: "2"
                  }
                ]
              }
            ],
            name: "SG BUCCAL",
            expected_duration: {
              duration: "7",
              durationType: "Days"
            },
            category: "Single Gene",
            description: "SHORT DESC SG BUCCAL",
            dna_collection_process: "Epithelial Cells - Buccal Swab Collection Process",
            test_result_sample: "https://...",
            long_description: "LONG DESC SG BUCCAL",
            image: "https://g..."
          },
          order_flow: "RequestTest",
          blockMetaData: {
            blockNumber: 1,
            blockHash: "0xfc07..."
          }
        },
        sort: [
          "1,651,052,970,001"
        ]
      },
    ]
  }
}

export const stakingRequestService = [
  {
    countryId: "AF",
    country: "Afghanistan",
    totalRequests: 1,
    totalValue: {
      dbio: 10,
      dai: 0.2351556345735329,
      usd: 0.23502594011868216
    },
    services: [
      {
        category: "Single Gene",
        regionCode: "BDS",
        city: "Ashkāsham",
        totalRequests: 1,
        totalValue: {
          dbio: 10,
          dai: 0.2351556345735329,
          usd: 0.23502594011868216
        }
      }
    ]
  },
]

export const requestServiceByCustomer = [
  {
    request: {
      hash: "0x22d03a...",
      requester_address: "5GH6K...",
      lab_address: null,
      country: "ID",
      city: "Kota Administrasi Jakarta Barat",
      region: "JK",
      service_category: "Single Gene",
      staking_amount: "1",
      status: "Unstaked",
      created_at: "1,648,719,648,000",
      updated_at: null,
      unstaked_at: "1,648,719,702,000"
    },
    blockMetadata: {
      blockNumber: 1,
      blockHash: "0x23c7..."
    }
  },
]

export const provideRequestServiceResponse = [
  {
    request: {
      hash: "0xc33c6...",
      requester_address: "5Da5aHS...",
      lab_address: null,
      country: "ID",
      city: "Kota Administrasi Jakarta Barat",
      region: "JK",
      service_category: "Single Gene",
      staking_amount: "10",
      status: "Open",
      created_at: "1,649,141,340,001",
      updated_at: null,
      unstaked_at: null
    },
    blockMetadata: {
      blockNumber: 1,
      blockHash: "0xd5...."
    }
  }
]

export const geneticAnalysisByTrakingIdResponse = {
  genetic_analyst_tracking_id: "31F...",
  genetic_analyst_id: "5DcWi...",
  owner_id: "5Da5aHS...",
  report_link: "test",
  comment: null,
  rejected_title: null,
  rejected_description: null,
  genetic_analyst_order_id: "0x12a1e1e...",
  created_at: "1,651,046,556,001",
  updated_at: "1,651,047,972,001",
  status: "ResultReady",
  blockMetaData: {
    blockNumber: 1,
    blockHash: "0x533183bf55382..."
  }
}

export const geneticAnalysisOrderByGA = {
  info: {
    page: 1,
    count: 30
  },
  data: [
    {
      _index: "genetic-analysis-order",
      _id: "0xcf587067.....",
      _score: null,
      _source: {
        id: "0xcf587067.....",
        service_id: "0x0a05af...",
        customer_id: "5Da5aHS...",
        customer_box_public_key: "0x35aa27206...",
        seller_id: "5DcWiG6XUcB...",
        genetic_data_id: "0x9ded8122e2...",
        genetic_analysis_tracking_id: "C1CSACH...",
        currency: "DBIO",
        prices: [
          {
            component: "analyze_price",
            value: "10"
          }
        ],
        additional_prices: [],
        status: "Paid",
        created_at: "1,651,048,272,001",
        updated_at: "1,651,049,058,000",
        service_info: {
          name: "A Genome Services",
          prices_by_currency: [
            {
              currency: "DBIO",
              total_price: "10",
              price_components: [
                {
                  component: "analyze_price",
                  value: "10"
                }
              ],
              additional_prices: []
            }
          ],
          expected_duration: {
            duration: "4",
            duration_type: "Days"
          },
          description: "a service of genomic analysis and data interpretation services for those who need",
          test_result_sample: "https://..."
        },
        genetic_analyst_info: {
          first_name: "Harry James",
          last_name: "Potter",
          gender: "Male",
          date_of_birth: "473,385,600,000",
          email: "harry@potter.com",
          phone_number: "",
          specialization: "Personalized medicine",
          profile_link: "",
          profile_image: "https://..."
        },
        blockMetaData: {
          blockNumber: 419928,
          blockHash: "0xf4b98..."
        }
      },
      sort: [
        "1,651,048,272,001"
      ]
    },
  ]
}