import { cryptoWaitReady } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import {
  registerGeneticAnalyst,
  registerLab,
  stakeGeneticAnalyst,
} from '@debionetwork/polkadot-provider';
import { labDataMock } from '../mocks/models/labs/labs.mock';
import { geneticAnalystsDataMock } from '../mocks/models/genetic-analysts/genetic-analysts.mock';
import { connectionRetries } from './config';

// eslint-disable-next-line
const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9944';

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
  const api = await ApiPromise.create({
    provider: wsProvider,
  });

  const mnemonicUri = '//Alice';
  process.env.ADMIN_SUBSTRATE_MNEMONIC = mnemonicUri;
  console.log('debio-node resolved! ✅');

  console.log('Beginning debio-node migrations 🏇...');
  const keyring = new Keyring({ type: 'sr25519' });
  const pair = await keyring.addFromUri(mnemonicUri, { name: 'Alice default' });

  console.log('Injecting `Lab` into debio-node 💉...');

  // eslint-disable-next-line
  const labPromise = new Promise((resolve, reject) => {
    registerLab(api as any, pair, labDataMock.info, () =>
      resolve('`Lab` data injection successful! ✅'),
    );
  });

  console.log(await labPromise);

  console.log('Injecting `GeneticAnalyst` into debio-node 💉...');

  // eslint-disable-next-line
  const geneticAnalystsPromise = new Promise((resolve, reject) => {
    registerGeneticAnalyst(api as any, pair, geneticAnalystsDataMock.info, () =>
      resolve('`GeneticAnalyst` data injection successful! ✅'),
    );
  });

  console.log(await geneticAnalystsPromise);

  // eslint-disable-next-line
  const stakeGeneticAnalystsPromise = new Promise((resolve, reject) => {
    stakeGeneticAnalyst(api as any, pair, () =>
      resolve('`GeneticAnalyst` staking successful! ✅'),
    );
  });

  console.log(await stakeGeneticAnalystsPromise);

  await wsProvider.disconnect();
  await api.disconnect();
  console.log('debio-node migration successful! 🙌');
};
