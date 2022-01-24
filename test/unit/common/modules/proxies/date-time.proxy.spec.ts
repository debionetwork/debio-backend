import { Test, TestingModule } from "@nestjs/testing";
import { dateTimeProxyMockFactory, MockType } from "../../../mock";
import { DateTimeProxy, DateTimeModule } from "../../../../../src/common"

describe('Date Time Proxy Unit Tests', () => {
  let dateTimeProxyMock: MockType<DateTimeProxy>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DateTimeProxy,
        {
          provide: DateTimeModule,
          useFactory: dateTimeProxyMockFactory,
        }
      ],
    }).compile();

    dateTimeProxyMock = module.get(DateTimeProxy);
  });

  it('should be defined', () => {
    expect(dateTimeProxyMock).toBeDefined();
  });

  it('should be get new date', async () => {
    const ES_RESULT = new Date();
    const RESULT = await dateTimeProxyMock.new()
    expect(RESULT).toEqual(ES_RESULT);
  })

  it('should be get now date', async () => {
    const ES_RESULT = Date.now();
    const RESULT = await dateTimeProxyMock.now()
    expect(RESULT).toEqual(ES_RESULT);
  })

  it('should be get now and add ', async () => {
    const DATE_WHEN_TEST = Number(Date.now())
    const RESULT = await dateTimeProxyMock.nowAndAdd(1)
    expect(RESULT).toEqual(DATE_WHEN_TEST+1);
  })
});