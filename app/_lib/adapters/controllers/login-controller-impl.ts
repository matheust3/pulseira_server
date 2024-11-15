import { LoginController } from "../../core/application/controllers/login-controller";
import { AuthService } from "../../core/application/gateways/auth-service";
import { ApiResponse } from "../../core/domain/models/routes/api-response";
import { Request } from "../../core/domain/models/routes/request";

export class LoginControllerImpl implements LoginController {
  private readonly authService: AuthService;
  constructor(args: { authService: AuthService }) {
    this.authService = args.authService;
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    try {
      const requestBody = (await req.json()) as { email: string; password: string };
      const token = await this.authService.login(requestBody.email, requestBody.password);
      res.status = 200;
      res.body = { token };
    } catch (error) {
      res.status = 401;
      res.body = { error: "Invalid email or password" };
    }
  }
}
