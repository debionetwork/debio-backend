import { Controller, UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from '../../common';

@UseInterceptors(SentryInterceptor)
@Controller('escrow')
export class EscrowController {
  onModuleInit() {
    console.log('Init Ethereum Controller');
  }
}
