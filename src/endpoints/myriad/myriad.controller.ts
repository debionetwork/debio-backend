import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthUserDTO } from './dto/auth-user.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
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
    });

    return {
      ...registerRes
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
      ...authRes
    };
  }
}
