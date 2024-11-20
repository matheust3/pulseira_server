export interface AuthToken<T> {
  data: T;
  iat: number;
  exp: number;
}
