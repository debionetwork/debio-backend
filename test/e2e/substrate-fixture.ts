import { cryptoWaitReady } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { registerLab } from '@debionetwork/polkadot-provider';
import { labDataMock } from '../mocks/models/labs/labs.mock';

module.exports = async () => {
  // Wait for Substrate to open connection.
  console.log('Waiting for Substrate connection to resolve ⏰...');
  await cryptoWaitReady();
  console.log('Substrate connection to resolved! ✅');

  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({
    provider: wsProvider,
  });

  const keyring = new Keyring({ type: 'sr25519' });
  const pair = keyring.addFromUri('//Alice', { name: 'Alice default' });

  const promise = new Promise((resolve, reject) => { // eslint-disable-line
    registerLab(api as any, pair, labDataMock.info, () =>
      resolve('registerLab'),
    );
  });

  await promise;
  await api.disconnect();
};
