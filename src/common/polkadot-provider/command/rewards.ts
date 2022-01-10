import { ApiPromise } from "@polkadot/api";

export async function sendRewards(api: ApiPromise, pair: any, substrateAddress: string, rewardAmount: string) {
    await api.tx.userProfile
        .rewardFunds(substrateAddress, rewardAmount)
        .signAndSend(pair, { nonce: -1 });
}