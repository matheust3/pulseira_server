import { AuthService } from "@/app/_lib/core/application/gateways/auth-service";
import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Middleware } from "@/app/_lib/core/domain/models/routes/middleware";
import { Request } from "@/app/_lib/core/domain/models/routes/request";

export class Guard implements Middleware {
  private readonly authService: AuthService;
  constructor(args: { authService: AuthService }) {
    this.authService = args.authService;
  }

  async handler(request: Request, response: ApiResponse, next: () => void): Promise<void> {
    try {
      const token = request.headers.get("authorization")?.split(" ")[1];
      if (!token) {
        response.body = { error: "unauthorized" };
        response.status = 401;
      } else {
        try {
          const result = await this.authService.verifyToken(token);
          request.authorization.token = token;
          request.authorization.userId = result.data.id;
          next();
        } catch (error) {
          response.body = { error: "unauthorized" };
          response.status = 401;
        }
      }
    } catch (error) {
      response.body = { error: "unauthorized" };
      response.status = 401;
    }
  }
}
