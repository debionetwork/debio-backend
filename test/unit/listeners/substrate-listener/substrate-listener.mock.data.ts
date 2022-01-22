export const ERROR_MOCK = {
    name: "NAME",
    message: "MESSAGE",
    stack: "STACK",
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
}
export const THEN_MOCK = {
    then: fn2 => {
        fn2("EVENT");
        return CATCH_MOCK;
    }
};
export const CATCH_MOCK = {
    catch: fn3 => {
        fn3(ERROR_MOCK);
    }
};
export const API_MOCK = {
    rpc: {
      chain: {
        getBlock: () => {
          return BLOCK_MOCK
        },
        getBlockHash: number => { // eslint-disable-line
          return BLOCK_HASH_MOCK
        },
      },
    },
    query: {
      system: {
        events: fn => {
          fn();
          return THEN_MOCK;
        }
      }
    }
};