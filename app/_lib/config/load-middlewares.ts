import { GetEmailTokenRateLimiter } from "@/middlewares";
import { RecoverPasswordRateLimiter } from "@/middlewares/recover-password-rate-limiter";

export class LoadMiddlewares {
  private readonly _getEmailTokenRateLimiter: GetEmailTokenRateLimiter;
  public get getEmailTokenRateLimiter(): GetEmailTokenRateLimiter {
    return this._getEmailTokenRateLimiter;
  }

  private readonly _recoverPasswordRateLimiter: RecoverPasswordRateLimiter;
  public get recoverPasswordRateLimiter(): RecoverPasswordRateLimiter {
    return this._recoverPasswordRateLimiter;
  }

  constructor() {
    this._getEmailTokenRateLimiter = new GetEmailTokenRateLimiter();
    this._recoverPasswordRateLimiter = new RecoverPasswordRateLimiter();
  }
}
