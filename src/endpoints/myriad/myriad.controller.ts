import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUserDTO } from './dto/auth-user.dto';
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
    @Headers('Authorization') auth: string,
  ) {
    const content: ContentInterface[] =
      await this.myriadService.unlockableContent(auth, filter);

    return {
      data: content,
    };
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

  @Patch('profile/edit')
  @ApiBody({ type: ProfileDTO })
  @ApiOperation({
    description: 'Update profile',
  })
  public async editProfile(@Body() data: ProfileDTO) {
    return await this.myriadService.editProfile({
      name: data.name,
      bio: data.bio,
      websiteURL: data.websiteURL,
    });
  }
}
