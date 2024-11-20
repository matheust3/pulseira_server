import { NextRequest } from "next/server";
import { Authorization, RemoteAddress, Request, Url } from "../core/domain/models/routes/request";
import { InvalidJsonError } from "../core/domain/errors/invalid-json-error";

export const nextRequestAdapter = (req: NextRequest): Request => {
  return new NextRequestAdapter(req);
};

class NextRequestAdapter implements Request {
  headers: Headers;
  url: Url;
  remoteAddress: RemoteAddress;
  authorization: Authorization;
  body: ReadableStream<Uint8Array> | null;
  searchParams: URLSearchParams;

  private _jsonBody: unknown | null = null;
  private readonly _req: NextRequest;

  constructor(req: NextRequest) {
    this._req = req;
    this.headers = req.headers;
    this.url = {
      pathname: req.nextUrl.pathname,
    };
    this.remoteAddress = {
      ip: req.ip,
    };
    this.authorization = {
      token: undefined,
      user: undefined,
    };

    if (req.body) {
      this.body = req.body;
    } else {
      this.body = null;
    }

    this.searchParams = new URLSearchParams(req.nextUrl.search);
  }

  async json(): Promise<unknown> {
    if (this._jsonBody === null) {
      try {
        this._jsonBody = await this._req.json();
      } catch (e) {
        throw new InvalidJsonError();
      }
    }
    return this._jsonBody;
  }
}
