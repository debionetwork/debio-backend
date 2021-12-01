import { DateTimeProxy } from "src/common/date-time/date-time.proxy";
import { Repository } from "typeorm";

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    find: jest.fn(entity => entity),
    findOne: jest.fn(entity => entity),
    save: jest.fn(entity => entity),
}));

export const dateTimeProxyMockFactory: () => MockType<DateTimeProxy> = jest.fn(() => ({
  now: jest.fn(entity => entity),
  nowAndAdd: jest.fn(entity => entity)
}));