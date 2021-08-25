import { Body, Controller, Post, Res } from '@nestjs/common';
import { SubstrateService } from './substrate.service';
import { Response } from 'express';

export type RegistrationRole = 'lab' | 'doctor' | 'hospital';

export class GetDbioOnRegisterDto {
  accountId: string;
  role: RegistrationRole;
}

@Controller('substrate')
export class SubstrateController {
  substrateService: SubstrateService;
  constructor(substrateService: SubstrateService) {
    this.substrateService = substrateService;
  }

  async onApplicationBootstrap() {
    this.substrateService.listenToEvents();
  }

  @Post('/get-dbio-pre-register')
  async getDbioPreRegister(
    @Body() payload: GetDbioOnRegisterDto,
    @Res() response: Response,
  ) {
    const { accountId, role } = payload;
    if (!accountId) {
      return response.status(400).send('accountId is required');
    }
    if (['lab', 'doctor', 'hospital'].includes(role) == false) {
      return response.status(400).send('role not found');
    }
    try {
      const hasRole = await this.substrateService.hasRole(accountId, role);
      if (hasRole) {
        return response.status(208).send('User has already registered');
      }
      await this.substrateService.sendDbioFromFaucet(
        accountId,
        '1000000000000000000',
      );
      return response.status(200).send(`1 DBIO sent to ${accountId}`);
    } catch (err) {
      return response.status(500);
    }
  }
}
