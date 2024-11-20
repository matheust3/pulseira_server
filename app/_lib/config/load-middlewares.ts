import { GetEmailTokenRateLimiter } from "@/middlewares";
import { Guard } from "@/middlewares/guard";
import { LoginRateLimiter } from "@/middlewares/login-rate-limiter";
import { RecoverPasswordRateLimiter } from "@/middlewares/recover-password-rate-limiter";
import { AuthService } from "../core/application/gateways/auth-service";

export class LoadMiddlewares {
  private readonly _getEmailTokenRateLimiter: GetEmailTokenRateLimiter;
  public get getEmailTokenRateLimiter(): GetEmailTokenRateLimiter {
    return this._getEmailTokenRateLimiter;
  }

  private readonly _guard: Guard;
  public get guard(): Guard {
    return this._guard;
  }

  private readonly _recoverPasswordRateLimiter: RecoverPasswordRateLimiter;
  public get recoverPasswordRateLimiter(): RecoverPasswordRateLimiter {
    return this._recoverPasswordRateLimiter;
  }

  private readonly _loginRateLimiter: LoginRateLimiter;
  public get loginRateLimiter(): LoginRateLimiter {
    return this._loginRateLimiter;
  }

  constructor(args: { authService: AuthService }) {
    this._getEmailTokenRateLimiter = new GetEmailTokenRateLimiter();
    this._recoverPasswordRateLimiter = new RecoverPasswordRateLimiter();
    this._loginRateLimiter = new LoginRateLimiter();

    this._guard = new Guard({ authService: args.authService });
  }
}
