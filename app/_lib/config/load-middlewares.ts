import { GetEmailTokenRateLimiter } from "@/middlewares";

export class LoadMiddlewares {
  private readonly _getEmailTokenRateLimiter: GetEmailTokenRateLimiter;
  public get getEmailTokenRateLimiter(): GetEmailTokenRateLimiter {
    return this._getEmailTokenRateLimiter;
  }

  constructor() {
    this._getEmailTokenRateLimiter = new GetEmailTokenRateLimiter();
  }
}
