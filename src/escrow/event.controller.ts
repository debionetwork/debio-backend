import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class TickerController {
  @MessagePattern('TICK')
  public ticker(data: number): Promise<number> {
    return Promise.resolve(data);
  }
}
