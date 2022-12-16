import { keyList } from '@common/secrets';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

interface UsernameCheckInterface {
  status: boolean;
}

interface AuthUserInterface {
  accessToken: string;
}

@Injectable()
export class MyriadService {
  private myriadEndPoints: string;
  private network: string;

  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
  ) {
    this.myriadEndPoints = this.gCloudSecretManagerService
      .getSecret('MYRIAD_HOST_ENDPOINT')
      .toString();
    this.network = this.gCloudSecretManagerService.getSecret("NETWORK_WALLET").toString();
  }

  public async checkUsernameMyriad(username: string): Promise<boolean> {
    const res = await axios.get<any, AxiosResponse<UsernameCheckInterface>>(
      `${this.myriadEndPoints}/users/username/${username}`,
    );
    return res.data.status;
  }

  public async registerMyriadUser({
    username,
    name,
    address,
  }:{
    username: string;
    name: string;
    address: string;
  }) {
    const res = await axios.post(`${this.myriadEndPoints}/authentication/signup/wallet`, {
      username: username,
      name: name,
      address: address,
      network: this.network,
    });

    return res.data;
  }

  public async authMyriadUser({
    nonce,
    publicAddress,
    signature,
    walletType,
    networkType,
    role,
  }: {
    nonce: number;
    publicAddress: string;
    signature: string;
    walletType: string;
    networkType: string;
    role: string;
  }) {
    const res = await axios.post<any, AxiosResponse<AuthUserInterface>>(`${this.myriadEndPoints}/authentication/login/wallet`, {
      nonce,
      publicAddress,
      signature,
      walletType,
      networkType,
      role,
    });

    return res.data;
  }
}
