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

  it('should be get new date', () => {
    expect(dateTimeProxyMock.new()).toEqual(new Date());
  })

  it('should be get now date', () => {
    expect(dateTimeProxyMock.now()).toEqual(Date.now());
  })

  it('should be get now and add ', () => {
    const DATE_WHEN_TEST = Number(new Date())
    expect(dateTimeProxyMock.nowAndAdd(1)).toEqual(DATE_WHEN_TEST+1);
  })
});