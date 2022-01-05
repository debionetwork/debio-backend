import { ApiPromise } from '@polkadot/api';

export async function queryAccountIdByEthAddress(api: ApiPromise, ethAddress: string): Promise<string> {
  return (await api.query.userProfile.accountIdByEthAddress(ethAddress)).toString();
}