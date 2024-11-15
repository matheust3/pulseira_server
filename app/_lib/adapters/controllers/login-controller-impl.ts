import { LoginController } from "../../core/application/controllers/login-controller";
import { AuthService } from "../../core/application/gateways/auth-service";
import { ApiResponse } from "../../core/domain/models/routes/api-response";
import { Request } from "../../core/domain/models/routes/request";
import { emailValidator } from "../../utils/validators/email-validator";

export class LoginControllerImpl implements LoginController {
  private readonly authService: AuthService;
  constructor(args: { authService: AuthService }) {
    this.authService = args.authService;
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    try {
      const requestBody = (await req.json()) as { email: string; password: string };
      const validEmail = await emailValidator.validate(requestBody.email);
      const token = await this.authService.login(validEmail, requestBody.password);
      res.status = 200;
      res.body = { token };
    } catch (error) {
      res.status = 401;
      res.body = { error: "Invalid email or password" };
    }
  }
}
