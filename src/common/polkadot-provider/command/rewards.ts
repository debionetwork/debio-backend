import { ApiPromise } from '@polkadot/api';

export const dbioUnit: number = 10 ** 18;

export function convertToDbioUnit(number: number): number {
  return number * dbioUnit;
}

export function convertToDbioUnitString(number: number): string {
  return (number * dbioUnit).toString();
}

export async function sendRewards(
  api: ApiPromise,
  pair: any,
  substrateAddress: string,
  rewardAmount: string,
) {
  await api.tx.rewards
    .rewardFunds(substrateAddress, rewardAmount)
    .signAndSend(pair, { nonce: -1 });
}
