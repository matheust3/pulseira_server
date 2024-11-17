import { User } from "../user";

export type Url = {
  pathname: string;
};
export type RemoteAddress = {
  ip?: string;
};

export type Authorization = {
  token?: string;
  user: User;
};
export interface Request {
  authorization: Authorization;
  headers: Headers;
  json: () => Promise<unknown>;
  url: Url;
  remoteAddress: RemoteAddress;
  body: ReadableStream<Uint8Array> | null;
  searchParams: URLSearchParams;
}
