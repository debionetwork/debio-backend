import { ApiPromise } from '@polkadot/api';

export async function queryAccountIdByEthAddress(
  api: ApiPromise,
  ethAddress: string,
): Promise<string> {
  return (
    await api.query.userProfile.accountIdByEthAddress(ethAddress)
  ).toString();
}

export async function queryEthAdressByAccountId(
  api: ApiPromise,
  accountId: string,
): Promise<string> {
  return (
    await api.query.userProfile.ethAddressByAccountId(accountId)
  ).toString();
}
