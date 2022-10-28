export type Writeable<T> = { -readonly [K in keyof T]: T[K] };
export type ExtractStrict<T, U extends T> = Extract<T, U>;
