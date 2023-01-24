import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthUserDTO } from './dto/auth-user.dto';
import { PostDTO } from './dto/post.dto';
import { ProfileDTO } from './dto/profile.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
import { TimelineDTO } from './dto/timeline.dto';
import {
  ContentInterface,
  NetworkTypeEnum,
  ReferenceTypeEnum,
  StatusEnum,
  SymbolEnum,
} from './interface/content';
import { MyriadService } from './myriad.service';

@Controller('myriad')
export class MyriadController {
  constructor(public readonly myriadService: MyriadService) {}

  @Get('username/check')
  @ApiOperation({
    description: 'Check username availablity',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: true,
      },
    },
  })
  public async checkUsername(@Query('username') username: string) {
    const status: boolean = await this.myriadService.checkUsernameMyriad(
      username,
    );

    return {
      status,
    };
  }

  @ApiHeader({
    name: 'JWT',
  })
  @Get('content/unlockable')
  @ApiOperation({
    description: 'Get Unlockable Content from myriad',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [],
      },
    },
  })
  public async getContentUnlockable(@Headers('JWT') jwt: string) {
    const content: ContentInterface[] =
      await this.myriadService.unlockableContent(jwt);

    return {
      data: content,
    };
  }

  @Get('auth/nonce/:hex_wallet_address')
  @ApiParam({ name: 'hex_wallet_address' })
  @ApiOperation({
    description: 'get nonce for authentication with hex wallet address',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        nonce: 1,
      },
    },
  })
  public async getNonceMyriad(
    @Param('hex_wallet_address') hexWalletAddress: string,
  ) {
    return await this.myriadService.getNonce({
      hexWalletAddress: hexWalletAddress,
    });
  }

  @Post('register')
  @ApiBody({ type: RegisterUserDTO })
  @ApiOperation({
    description: 'Register Myriad Account',
  })
  public async registerMyriadUser(@Body() data: RegisterUserDTO) {
    const registerRes = await this.myriadService.registerMyriadUser({
      username: data.username,
      name: data.name,
      address: data.address,
      role: data.role.toLowerCase(),
    });

    return {
      ...registerRes,
    };
  }

  @Post('auth')
  @ApiBody({ type: AuthUserDTO })
  @ApiOperation({
    description: 'Auth Myriad Account',
  })
  public async authMyriadUser(@Body() data: AuthUserDTO) {
    const authRes = await this.myriadService.authMyriadUser({
      nonce: data.nonce,
      publicAddress: data.publicAddress,
      signature: data.signature,
      walletType: data.walletType,
      networkType: data.networkType,
      role: data.role.toLowerCase(),
    });

    return {
      ...authRes,
    };
  }

  @ApiHeader({
    name: 'JWT',
  })
  @Post('profile/edit')
  @ApiBody({ type: ProfileDTO })
  @ApiOperation({
    description: 'Update profile',
  })
  public async editProfile(
    @Body() data: ProfileDTO,
    @Headers('JWT') jwt: string,
  ) {
    return await this.myriadService.editProfile({
      name: data.name,
      bio: data.bio,
      websiteURL: data.websiteURL,
      jwt: jwt,
    });
  }

  @ApiHeader({
    name: 'JWT',
  })
  @Post('post/create')
  @ApiBody({ type: PostDTO })
  @ApiOperation({
    description: 'Post to myriad',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        originCreatedAt: '2022-12-26T15:06:20.751Z',
        id: '63a9b86c917d3e001cc6d901',
        tags: [],
        platform: 'myriad',
        text: '[{"type":"p","children":[{"text":"test"}]}]',
        metric: {
          upvotes: 0,
          downvotes: 0,
          discussions: 0,
          debates: 0,
          comments: 0,
          tips: 0,
        },
        isNSFW: false,
        visibility: 'private',
        mentions: [],
        selectedUserIds: [],
        banned: false,
        createdAt: '2022-12-26T15:06:20.751Z',
        updatedAt: '2022-12-26T15:06:20.751Z',
        createdBy: '63a196939bf7c8001c58f13e',
      },
    },
  })
  public async postToMyriad(
    @Body() data: PostDTO,
    @Headers('JWT') jwt: string,
  ) {
    const {
      createdBy,
      isNSFW,
      visibility,
      selectedUserIds,
      rawText,
      text,
      postType,
    } = data;
    const res = await this.myriadService.postToMyriad({
      createdBy: createdBy,
      isNSFW: isNSFW,
      visibility: visibility,
      selectedUserIds: selectedUserIds,
      rawText: rawText,
      text: text,
      jwt: jwt,
      postType: postType,
    });

    return {
      ...res,
    };
  }

  @ApiHeader({
    name: 'JWT',
  })
  @Get('timeline/:userid')
  @ApiParam({ name: 'userid' })
  @ApiOperation({
    description: 'Get custom timeline',
  })
  public async getTimeline(
    @Param('userid') userId: string,
    @Headers('JWT') jwt: string,
  ) {
    const res = await this.myriadService.getCustomTimeline(userId, jwt);

    return {
      ...res,
    };
  }

  @Get('check/user/:address')
  @ApiParam({ name: 'address' })
  @ApiOperation({
    description: 'Check address user and return jwt',
  })
  public async getUserMyriad(@Param('address') address: string) {
    const res = await this.myriadService.checkUserMyriadTable(address);

    return {
      ...res,
    };
  }

  @Post('timeline/add-user')
  @ApiBody({ type: TimelineDTO })
  @ApiOperation({
    description: 'Post to myriad',
  })
  public async addUserToTimeline(
    @Body() data: TimelineDTO,
  ) {
    const { selectedUser, timelineId } = data;
    const res = await this.myriadService.customVisibilityTimeline(
      selectedUser,
      timelineId,
    );

    return {
      ...res,
    };
  }

  @ApiHeader({
    name: 'JWT',
  })
  @Get('content/comment/total/:user_id')
  @ApiParam({ name: 'user_id' })
  @ApiOperation({
    description: 'get total paid content comment by user id',
  })
  public async totalPaidContentComment(
    @Param('user_id') userId: string,
    @Headers('JWT') jwt: string,
  ) {
    const res = await this.myriadService.getTotalPaidContentComment(
      userId,
      jwt,
    );

    return {
      ...res,
    };
  }

  @ApiHeader({
    name: 'JWT',
  })
  @Get('tip/total')
  @ApiQuery({
    name: 'status',
    enum: StatusEnum,
    isArray: true,
    example: Object.values(StatusEnum),
  })
  @ApiQuery({
    name: 'referenceType',
    enum: ReferenceTypeEnum,
    isArray: true,
    example: Object.values(ReferenceTypeEnum),
  })
  @ApiQuery({
    name: 'networkType',
    enum: NetworkTypeEnum,
    isArray: true,
    example: Object.values(NetworkTypeEnum),
  })
  @ApiQuery({
    name: 'symbol',
    enum: SymbolEnum,
    isArray: true,
    example: Object.values(SymbolEnum),
  })
  @ApiOperation({
    description: 'get total tip user',
  })
  public async getTotalTip(
    @Query('status') status: StatusEnum,
    @Query('referenceType') referenceType: ReferenceTypeEnum,
    @Query('networkType') networkType: NetworkTypeEnum,
    @Query('symbol') symbol: SymbolEnum,
    @Headers('JWT') jwt: string,
  ) {
    const res = await this.myriadService.getTotalTipFromUser(
      referenceType,
      networkType,
      symbol,
      status,
      jwt,
    );

    return {
      ...res,
    };
  }

  @Get('/list/userid')
  @ApiQuery({
    name: 'role',
    enum: [
      'customer',
      'health-professional/physical-health',
      'health-professional/mental-health',
    ],
  })
  @ApiOperation({
    description: 'get list userid',
  })
  public async getListUserId(@Query('role') role: string) {
    const res = await this.myriadService.getListUserId(role);

    return {
      status: 200,
      data: res,
    };
  }
}
