import { keyList } from '@common/secrets';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import { AuthUserInterface } from './interface/auth-user';
import { ContentInterface } from './interface/content';
import { Post, Visibility } from './interface/post';
import { UsernameCheckInterface } from './interface/username-check';
import { MyriadAccount } from './models/myriad-account.entity';

@Injectable()
export class MyriadService {
  private myriadEndPoints: string;

  constructor(
    @InjectRepository(MyriadAccount)
    private readonly myriadAccountRepository: Repository<MyriadAccount>,
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

  public async getCustomTimeline(userId: string, jwt: string) {
    const res = await axios.get(`${this.myriadEndPoints}/experiences`, {
      params: {
        visibility: 'selected_user',
        userId: userId,
      },
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    return res.data;
  }

  public async registerMyriadUser({
    username,
    name,
    address,
    role,
  }: {
    username: string;
    name: string;
    address: string;
    role: string;
  }) {
    const res = await axios.post(
      `${this.myriadEndPoints}/authentication/signup/wallet`,
      {
        username: username,
        name: name,
        address: address,
        network: 'debio',
      },
    );

    await this.myriadAccountRepository.insert({
      address: address,
      username: username,
      role: role ?? '',
      jwt_token: '',
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
    const res = await axios.post<any, AxiosResponse<AuthUserInterface>>(
      `${this.myriadEndPoints}/authentication/login/wallet`,
      {
        nonce,
        publicAddress,
        signature,
        walletType,
        networkType,
        role,
      },
    );

    const account = await this.myriadAccountRepository.findOne({
      where: {
        address: publicAddress,
        role: role,
      },
    });

    if (account) {
      await this.myriadAccountRepository.update(
        { id: account.id },
        {
          jwt_token: res.data.accessToken,
        },
      );

      return {
        status: 200,
        jwt: res.data.accessToken,
      };
    }

    return {
      status: 401,
      message: 'account not found',
    };
  }

  public async unlockableContent(auth: string, filter: string) {
    const res = await axios.get<any, AxiosResponse<ContentInterface[]>>(
      `${this.myriadEndPoints}/user/unlockable-contents`,
      {
        params: {
          filter: filter,
        },
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      },
    );

    const content: ContentInterface[] = res.data;

    return content;
  }

  public async editProfile({
    name,
    bio,
    websiteURL,
    auth,
  }: {
    name?: string;
    bio?: string;
    websiteURL?: string;
    auth: string;
  }) {
    const res = await axios.patch(
      `${this.myriadEndPoints}/user/me`,
      {
        name,
        bio,
        websiteURL,
      },
      {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      },
    );

    return res.data;
  }

  public async getNonce({ hexWalletAddress }: { hexWalletAddress: string }) {
    const res = await axios.get(
      `${this.myriadEndPoints}/authentication/nonce`,
      {
        params: {
          id: hexWalletAddress,
          type: 'wallet',
        },
      },
    );

    return res.data;
  }

  public async postToMyriad({
    createdBy,
    isNSFW,
    visibility,
    text,
    rawText,
    selectedUserIds,
  }: {
    createdBy: string;
    isNSFW: boolean;
    rawText: string;
    text: string;
    selectedUserIds?: string[];
    visibility: Visibility;
  }) {
    const res = await axios.post<any, AxiosResponse<Post>>(
      `${this.myriadEndPoints}/user/posts`,
      {
        createdBy: createdBy,
        isNSFW: isNSFW,
        mentions: [],
        rawText: rawText,
        status: 'published',
        tags: [],
        text: text,
        selectedUserIds: selectedUserIds,
        visibility: visibility,
      },
    );

    return res;
  }
}
