import {
  Body,
  Controller,
  Get,
  Headers,
  Request,
  Post,
  Query,
  Req,
  Header,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthUserDTO } from './dto/auth-user.dto';
import { PostDTO } from './dto/post.dto';
import { ProfileDTO } from './dto/profile.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
import { ContentInterface } from './interface/content';
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
  public async getContentUnlockable(
    @Query('filter') filter: string,
    @Headers('JWT') auth: string,
  ) {
    const content: ContentInterface[] =
      await this.myriadService.unlockableContent(auth, filter);

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
      role: data.role,
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
      role: data.role,
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
    @Headers('JWT') auth: string,
  ) {
    return await this.myriadService.editProfile({
      name: data.name,
      bio: data.bio,
      websiteURL: data.websiteURL,
      auth: auth,
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
  public async postToMyriad(@Body() data: PostDTO) {
    const res = await this.myriadService.postToMyriad({
      createdBy: data.createdBy,
      isNSFW: data.isNSFW,
      visibility: data.visibility,
      selectedUserIds: data.selectedUserIds,
      rawText: data.rawText,
      text: data.text,
    });

    return {
      ...res,
    };
  }
}
