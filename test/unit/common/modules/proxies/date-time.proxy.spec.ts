import { Test, TestingModule } from "@nestjs/testing";
import { dateTimeProxyMockFactory } from "../../../mock";
import { DateTimeProxy, DateTimeModule } from "../../../../../src/common"

describe('Date Time Proxy Unit Tests', () => {
  let dateTimeProxyMock: DateTimeProxy

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DateTimeProxy,
        {
          provide: DateTimeModule,
          useFactory: dateTimeProxyMockFactory,
        },
      ],
    }).compile();

    dateTimeProxyMock = module.get(DateTimeProxy);
  });

  it('should be defined', () => {
    expect(dateTimeProxyMock).toBeDefined();
  });

  it('should be get new date', async () => {
    jest
      .useFakeTimers()
      .setSystemTime(new Date('2022-01-24').getTime());
    const ES_RESULT = new Date();
    const RESULT = await dateTimeProxyMock.new()
    expect(RESULT).toEqual(ES_RESULT);
  })

  it('should be get now date', async () => {
    jest
    .useFakeTimers()
    .setSystemTime(new Date('2022-01-24').getTime());
    const ES_RESULT = Date.now();
    const RESULT = await dateTimeProxyMock.now()
    expect(RESULT).toEqual(ES_RESULT);
  })

  it('should be get now and add ', async () => {
    jest
    .useFakeTimers()
    .setSystemTime(new Date('2022-01-24').getTime());
    const DATE_WHEN_TEST = Number(Date.now())
    const RESULT = await dateTimeProxyMock.nowAndAdd(1)
    expect(RESULT).toEqual(DATE_WHEN_TEST+1);
  })
});
