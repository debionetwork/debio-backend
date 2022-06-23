import { cryptoWaitReady } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';

export async function initializeApi() {
  const keyring = new Keyring({ type: 'sr25519' });
  await cryptoWaitReady();

  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({
    provider: wsProvider,
  });
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

  return { api, pair: alice };
}
