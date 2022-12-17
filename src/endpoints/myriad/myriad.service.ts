import { keyList } from '@common/secrets';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

interface UsernameCheckInterface {
  status: boolean;
}

@Injectable()
export class MyriadService {
  private myriadEndPoints: string;

  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
  ) {
    this.myriadEndPoints = this.gCloudSecretManagerService
      .getSecret('MYRIAD_HOST_ENDPOINT')
      .toString();
  }

  public async checkUsernameMyriad(username: string): Promise<boolean> {
    const res = await axios.get<any, AxiosResponse<UsernameCheckInterface>>(
      `${this.myriadEndPoints}/users/username/${username}`,
    );
    return res.data.status;
  }
}
