import { AuthWithEmailOnly } from '@/app/_lib/core/domain/usecases/authentication/auth-with-email-only'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Middleware } from '@/app/_lib/core/domain/models/routes/middleware'
import { GetTokenPayload } from '@/app/_lib/core/domain/usecases/authentication/get-token-payload'

export class AuthMiddleware implements Middleware {
  private readonly authWithEmailOnly: AuthWithEmailOnly
  private readonly getTokenPayload: GetTokenPayload

  constructor(args: {
    authWithEmailOnly: AuthWithEmailOnly
    getTokenPayload: GetTokenPayload
  }) {
    this.authWithEmailOnly = args.authWithEmailOnly
    this.getTokenPayload = args.getTokenPayload
  }

  async handler(
    req: Request,
    res: ApiResponse,
    next: () => void,
  ): Promise<void> {
    try {
      const token = req.headers.get('authorization')?.split(' ')[1]
      if (!token) {
        res.body = { error: 'unauthorized' }
        res.status = 401
      } else {
        try {
          const result = await this.authWithEmailOnly.execute(token)
          res.headers.set('token', result)
          // set authorization userId to request
          const payload = await this.getTokenPayload.execute(token)
          req.authorization.userId = payload.userId
          next()
        } catch (error) {
          res.body = { error: 'unauthorized' }
          res.status = 401
        }
      }
    } catch (error) {
      res.body = { error: 'unauthorized' }
      res.status = 401
    }
  }
}
