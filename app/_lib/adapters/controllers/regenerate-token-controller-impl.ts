import { RegenerateTokenController } from "../../core/application/controllers/regenerate-token-controller";
import { AuthService } from "../../core/application/gateways/auth-service";
import { UnauthorizedError } from "../../core/domain/errors/unauthorized-error";
import { ApiResponse } from "../../core/domain/models/routes/api-response";
import { Request } from "../../core/domain/models/routes/request";

export class RegenerateTokenControllerImpl implements RegenerateTokenController {
  private readonly authService: AuthService;

  constructor(args: { authService: AuthService }) {
    this.authService = args.authService;
  }

  public async get(req: Request, res: ApiResponse): Promise<void> {
    const token = req.authorization.token;
    if (!token) {
      res.status = 401;
      res.body = { message: "Unauthorized" };
    } else {
      try {
        const newToken = await this.authService.regenerateToken(token);
        res.status = 200;
        res.body = { token: newToken };
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          res.status = 401;
          res.body = { message: "Unauthorized" };
        } else {
          throw e;
        }
      }
    }
  }
}
