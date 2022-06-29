const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {    
    const testsArray = Array.from(tests);
    
    const sequence = [];
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/orders/order-failed.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/orders/order-fulfilled.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/genetic-testing/data-staked.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/service-request/service-request-partial.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/labs/stake-successful.spec.ts');
    }));
    sequence.push(...testsArray.filter(obj => {
      return obj.path.includes('listeners/substrate-listener/commands/labs/unstake-successful.spec.ts');
    }));

    return sequence;
  }
}

module.exports = CustomSequencer;