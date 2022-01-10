import { ApiPromise } from "@polkadot/api";

export async function setEthAddress(api: ApiPromise, pair: any, substrateAddress: string, ethAddress: string): Promise<string>{
    const response = await api.tx.userProfile
        .adminSetEthAddress(substrateAddress, ethAddress)
        .signAndSend(pair, { nonce: -1 });
    return response.toJSON();
}