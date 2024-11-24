import { ChangePasswordController } from "@/app/_lib/core/application/controllers/user/change-password-controller";
import { AuthService } from "@/app/_lib/core/application/gateways/auth-service";
import { UserRepository } from "@/app/_lib/core/application/repositories/user-repository";
import { InvalidJsonError } from "@/app/_lib/core/domain/errors/invalid-json-error";
import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Request } from "@/app/_lib/core/domain/models/routes/request";
import { passwordValidator } from "@/app/_lib/utils/validators/password-validator";
import { ValidationError } from "yup";

export class ChangePasswordControllerImpl implements ChangePasswordController {
  private readonly userRepository: UserRepository;
  private readonly authService: AuthService;

  constructor(args: { userRepository: UserRepository; authService: AuthService }) {
    this.userRepository = args.userRepository;
    this.authService = args.authService;
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    if (req.authorization.user === undefined) {
      res.status = 401;
      res.body = { message: "Unauthorized" };
    } else {
      try {
        const body = (await req.json()) as { oldPassword: string; newPassword: string };
        // Validar a senha nova
        const validatedPass = await passwordValidator.validate(body.newPassword);

        // Verificar se a senha antiga é válida
        try {
          await this.authService.login(req.authorization.user.email, body.oldPassword);
        } catch (e) {
          res.status = 403;
          res.body = { message: "Invalid old password" };
          return;
        }
        // Atualizar a senha
        await this.userRepository.changePassword(req.authorization.user.id, validatedPass);
        res.status = 200;
        res.body = { message: "Password updated successfully" };
      } catch (e) {
        if (e instanceof InvalidJsonError) {
          res.status = 400;
          res.body = { message: "Invalid JSON" };
        } else if (e instanceof ValidationError) {
          res.status = 400;
          res.body = { message: e.message };
        } else {
          res.status = 500;
          res.body = { message: "Internal server error" };
        }
      }
    }
  }
}
