// Garantindo que só as propriedades sejam necessárias
export type OnlyProps<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};
