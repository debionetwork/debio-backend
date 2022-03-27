export const serviceDataMock = {
  id: 'ID',
  ownerId: 'OWNER_ID',
  serviceFlow: 'RequestTest',
  info: {
    name: 'string',
    category: 'string',
    description: 'string',
    pricesByCurrency: [
      {
        priceComponents: [
          {
            component: 'string',
            value: '1',
          },
        ],
        additionalPrices: [
          {
            component: 'string',
            value: '1',
          },
        ],
        currency: 'DAI',
        totalPrice: '2',
      },
    ],
    expectedDuration: {
      duration: '1',
      durationType: 'Days',
    },
    testResultSample: 'string',
    longDescription: 'string',
    image: 'string',
    dnaCollectionProcess: 'string',
  },
};
