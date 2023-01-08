import { keyList } from '@common/secrets';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosResponse } from 'axios';
import { Repository } from 'typeorm';
import { AuthUserInterface } from './interface/auth-user';
import { ContentInterface } from './interface/content';
import { Post, Visibility } from './interface/post';
import { TimelineInterface } from './interface/timeline';
import { UsernameCheckInterface } from './interface/username-check';
import { MyriadAccount } from './models/myriad-account.entity';

@Injectable()
export class MyriadService {
  private readonly logger: Logger = new Logger(MyriadService.name);
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
    try {
      const res = await axios.get<any, AxiosResponse<UsernameCheckInterface>>(
        `${this.myriadEndPoints}/users/username/${username}`,
      );
      return res.data.status;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async customVisibilityTimeline(
    userId: string,
    jwt: string,
    timelineid: string,
  ) {
    try {
      const timelineReq = await axios.get<
        any,
        AxiosResponse<TimelineInterface>
      >(`${this.myriadEndPoints}/experiences/${timelineid}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const { data } = timelineReq;

      const newSelectedUserIds = [...data.selectedUserIds, userId];

      const patchTimeline = await axios.patch(
        `${this.myriadEndPoints}/user/experiences/${timelineid}`,
        {
          id: data.id,
          selectedUserIds: newSelectedUserIds,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      return patchTimeline.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async getCustomTimeline(userId: string, jwt: string) {
    try {
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
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async getTotalPaidContentComment(userid: string, jwt: string) {
    try {
      const res = await axios.get(
        `${this.myriadEndPoints}/user/comments/count`,
        {
          params: {
            where: {
              'asset.exclusiveContents': { exists: true },
              userId: userid,
            },
          },
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
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
    try {
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
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
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
    try {
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
      } else {
        throw new Error('account_not_found');
      }
    } catch (err) {
      this.logger.error(err);

      if (err?.message === 'account_not_found') {
        throw new HttpException(
          {
            status: 400,
            message: 'account not found',
          },
          400,
        );
      } else {
        throw new HttpException(
          err?.response?.data ?? {
            status: 500,
            message: 'Something went wrong in server',
          },
          err?.response?.status ?? 500,
        );
      }
    }
  }

  public async unlockableContent(jwt: string) {
    try {
      const res = await axios.get<any, AxiosResponse<ContentInterface[]>>(
        `${this.myriadEndPoints}/user/comments`,
        {
          params: {
            filter: {
              include: [
                {
                  relation: 'post',
                  scope: {
                    include: [
                      {
                        relation: 'experiences',
                        scope: {
                          where: {
                            visibility: 'selected_user',
                          },
                        },
                      },
                      { relation: 'user' },
                    ],
                  },
                },
              ],
            },
          },
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      const content: ContentInterface[] = res.data;

      return content;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async editProfile({
    name,
    bio,
    websiteURL,
    jwt,
  }: {
    name?: string;
    bio?: string;
    websiteURL?: string;
    jwt: string;
  }) {
    try {
      const res = await axios.patch(
        `${this.myriadEndPoints}/user/me`,
        {
          name,
          bio,
          websiteURL,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async getNonce({ hexWalletAddress }: { hexWalletAddress: string }) {
    try {
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
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async postToMyriad({
    createdBy,
    isNSFW,
    visibility,
    text,
    rawText,
    selectedUserIds,
    jwt,
  }: {
    createdBy: string;
    isNSFW: boolean;
    rawText: string;
    text: string;
    selectedUserIds?: string[];
    visibility: Visibility;
    jwt: string;
  }) {
    try {
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
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      return res.data;
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(
        err?.response?.data ?? {
          status: 500,
          message: 'Something went wrong in server',
        },
        err?.response?.status ?? 500,
      );
    }
  }

  public async checkUserMyriadTable(address: string) {
    const user = await this.myriadAccountRepository.findOneBy({
      address: address,
    });

    return this.checkJWT(user);
  }

  private checkJWT(myriadAccount: MyriadAccount) {
    if (myriadAccount === null) {
      throw new HttpException(
        {
          status: 404,
          message: 'user not found',
        },
        404,
      );
    }
    if (myriadAccount.jwt_token === '' || myriadAccount.jwt_token === null) {
      throw new HttpException(
        {
          status: 401,
          message: 'user unauthenticated',
        },
        401,
      );
    } else {
      return {
        status: 200,
        jwt: myriadAccount.jwt_token,
      };
    }
  }
}
