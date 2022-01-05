import { Controller, UseInterceptors } from '@nestjs/common';
import { SentryInterceptor } from 'src/common';

@UseInterceptors(SentryInterceptor)
@Controller('escrow')
export class EscrowController {
  onModuleInit() {
    console.log('Init Ethereum Controller');
  }
}
