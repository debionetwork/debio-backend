import { Controller, Post, Body } from '@nestjs/common';
import { SubstrateService } from './substrate.service';

export class MessageDto {
  account_id: string;
  eth_address: string;
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

  @Post()
  async createBinding(@Body() message: MessageDto) {
    console.log(message);
    const response = await this.substrateService.bindingEthAddress(
      message.account_id,
      message.eth_address,
    );
    if (response == 'success') {
      return { status: 'ok' };
    }

    return { status: 'failed', data: response };
  }
}
