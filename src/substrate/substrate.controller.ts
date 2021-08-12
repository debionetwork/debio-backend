import { Controller, Post, Body } from '@nestjs/common';
import { SubstrateService } from './substrate.service';

export class MessageDto {
  mnemonic: string;
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
      message.mnemonic,
      message.eth_address,
    );
    if (response == 'success') {
      return { status: 'ok' };
    }

    return { status: 'failed', data: response };
  }
}
