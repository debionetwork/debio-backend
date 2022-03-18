import { Event as PolkadotTypesEvent } from '../../@polkadot-types-interfaces.mock';

export const ERROR_MOCK = {
  name: 'NAME',
  message: 'MESSAGE',
  stack: 'STACK',
};
export const NUMBER = 1;
export const BLOCK_MOCK = {
  block: {
    header: {
      number: {
        toNumber: () => NUMBER,
      },
    },
  },
};
export const BLOCK_HASH_MOCK = {
  toString: () => `${NUMBER}`,
};
export const THEN_MOCK = {
  then: (fn2) => {
    fn2('EVENT');
    return CATCH_MOCK;
  },
};
export const CATCH_MOCK = {
  catch: (fn3) => {
    fn3(ERROR_MOCK);
  },
};

let arr = [];
export const API_MOCK = {
  rpc: {
    chain: {
      getBlock: () => {
        return BLOCK_MOCK;
      },
      getBlockHash: (number) => { // eslint-disable-line
        return BLOCK_HASH_MOCK;
      },
    },
  },
  query: {
    system: {
      events: (fn) => {
        fn(arr);
        arr = []; // Reset array
        return THEN_MOCK;
      },
    },
  },
};
export const API_MOCK_GEN = (_arr: Array<any>) => {
  arr = _arr;
  return API_MOCK;
};
export const TO_HUMAN_MOCK = {
  toHuman: jest.fn(() => {
    return {
      id: 'string',
      serviceId: 'string',
      customerId: 'string',
      customerBoxPublicKey: 'string',
      sellerId: 'string',
      dnaSampleTrackingId: 'string',
      currency: 'CurrencyType' as any,
      prices: 'Price[]' as any,
      additionalPrices: 'Price[]' as any,
      status: 'OrderStatus' as any,
      orderFlow: 'ServiceFlow' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),
};
export const EVENT_MOCK: PolkadotTypesEvent = {
  data: [TO_HUMAN_MOCK],
  section: 'orders',
  method: 'OrderCreated',
};
export const FALSE_EVENT_MOCK: PolkadotTypesEvent = {
  data: ['DATA'],
  section: 'SECTION',
  method: 'METHOD',
};
