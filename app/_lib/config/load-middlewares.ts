import { GetEmailTokenRateLimiter } from "@/middlewares";
import { LoginRateLimiter } from "@/middlewares/login-rate-limiter";
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

  private readonly _loginRateLimiter: LoginRateLimiter;
  public get loginRateLimiter(): LoginRateLimiter {
    return this._loginRateLimiter;
  }

  constructor() {
    this._getEmailTokenRateLimiter = new GetEmailTokenRateLimiter();
    this._recoverPasswordRateLimiter = new RecoverPasswordRateLimiter();
    this._loginRateLimiter = new LoginRateLimiter();
  }
}
