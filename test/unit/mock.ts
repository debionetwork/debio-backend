import { Repository } from "typeorm";

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    find: jest.fn(entity => entity),
    // ...
}));