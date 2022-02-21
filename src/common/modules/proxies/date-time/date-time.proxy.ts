import { Injectable } from '@nestjs/common';

@Injectable()
export class DateTimeProxy {
  new(): Date {
    return new Date();
  }
  now(): number {
    return Date.now();
  }
  nowAndAdd(addition = 0): number {
    return Date.now() + addition;
  }
}
