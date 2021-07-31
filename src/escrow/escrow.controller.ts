import { Controller } from '@nestjs/common';

@Controller('escrow')
export class EscrowController {
  onModuleInit() {
    console.log('Init Ethereum Controller');
  }
}
