export const geneticAnalystServiceDataMock = {
  id: 'string',
  ownerId: 'string',
  info: {
    name: 'string',
    pricesByCurrency: [
      {
        currency: 'DAI',
        totalPrice: 1,
        priceComponents: [
          {
            component: 'string',
            value: 1,
          },
        ],
        additionalPrices: [
          {
            component: 'string',
            value: 1,
          },
        ],
      },
    ],
    expectedDuration: {
      duration: '1',
      durationType: 'WorkingDays',
    },
    description: 'string',
    testResultSample: 'string',
  },
};
