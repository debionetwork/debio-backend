import { cryptoWaitReady } from '@polkadot/util-crypto';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { connectionRetries } from './config';

// eslint-disable-next-line
const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9944';
process.env.SUBSTRATE_URL = wsUrl;

async function initalSubstrateConnection(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.addEventListener('open', () => {
      resolve(ws);
    });
    ws.addEventListener('error', () => {
      reject(ws);
    });
  });
}

module.exports = async () => {
  // Wait for Substrate to open connection.
  console.log('Waiting for debio-node to resolve ⏰...');
  await cryptoWaitReady();

  (await connectionRetries(initalSubstrateConnection, 40)).close();

  const wsProvider = new WsProvider(wsUrl);
  await ApiPromise.create({
    provider: wsProvider,
  });

  const mnemonicUri = '//Alice';
  process.env.ADMIN_SUBSTRATE_MNEMONIC = mnemonicUri;
  console.log('debio-node resolved! ✅');
};
