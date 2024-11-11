import { AuthMiddleware, GetEmailTokenRateLimiter } from '@/middlewares'
import { AuthWithEmailOnly } from '../core/domain/usecases/authentication/auth-with-email-only'
import { GetTokenPayload } from '../core/domain/usecases/authentication/get-token-payload'

export class LoadMiddlewares {
  private readonly _authMiddleware: AuthMiddleware
  public get authMiddleware(): AuthMiddleware {
    return this._authMiddleware
  }

  private readonly _getEmailTokenRateLimiter: GetEmailTokenRateLimiter
  public get getEmailTokenRateLimiter(): GetEmailTokenRateLimiter {
    return this._getEmailTokenRateLimiter
  }

  constructor(args: {
    authWithEmailOnly: AuthWithEmailOnly
    getTokenPayload: GetTokenPayload
  }) {
    this._authMiddleware = new AuthMiddleware({
      authWithEmailOnly: args.authWithEmailOnly,
      getTokenPayload: args.getTokenPayload,
    })

    this._getEmailTokenRateLimiter = new GetEmailTokenRateLimiter()
  }
}
