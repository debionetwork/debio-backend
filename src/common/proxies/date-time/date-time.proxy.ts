import { Injectable } from '@nestjs/common';

@Injectable()
export class DateTimeProxy {
  now(): number {
    return Date.now();
  }
  nowAndAdd(addition = 0): number {
    return Date.now() + addition;
  }
}
