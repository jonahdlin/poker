export type Writeable<T> = {-readonly [K in keyof T]: T[K]};
