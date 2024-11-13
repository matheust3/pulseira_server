import { ValidationError } from "yup";
import { RecoverPasswordController } from "../../core/application/controllers/recover-password-controller";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { ApiResponse } from "../../core/domain/models/routes/api-response";
import { Request } from "../../core/domain/models/routes/request";
import { generatePassword } from "../../utils/password-generator";
import { emailValidator } from "../../utils/validators/email-validator";
import { InvalidJsonError } from "../../core/domain/errors/invalid-json-error";
import { ResendEmailProvider } from "../../infra/gateways/resend-email-provider";
import { UserNotFoundError } from "../../core/domain/errors/user-not-found-error";

export class RecoverPasswordControllerImpl implements RecoverPasswordController {
  private readonly userRepository: UserRepository;
  private readonly emailProvider: ResendEmailProvider;

  constructor(args: { userRepository: UserRepository; emailProvider: ResendEmailProvider }) {
    this.userRepository = args.userRepository;
    this.emailProvider = args.emailProvider;
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    try {
      const requestBody = (await req.json()) as { email: string };
      const validatedEmail = await emailValidator.validate(requestBody.email);
      const password = generatePassword(12);
      await this.userRepository.updatePassword(validatedEmail, password);
      await this.emailProvider.sendEmail(
        validatedEmail,
        "Recuperação de senha",
        `Sua nova senha provisoria é: ${password}`,
        `<p>Sua nova senha provisoria é: <strong>${password}</strong></p>`,
      );
      res.status = 200;
      res.body = { message: "Password updated successfully" };
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status = 400;
        res.body = { error: error.message };
      } else if (error instanceof InvalidJsonError) {
        res.status = 400;
        res.body = { error: "Invalid JSON" };
      } else if (error instanceof UserNotFoundError) {
        res.status = 200;
        res.body = { message: "Password updated successfully" };
      } else {
        throw error;
      }
    }
  }
}
