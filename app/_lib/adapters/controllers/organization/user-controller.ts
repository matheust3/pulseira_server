import { ValidationError } from "yup";
import { UserController } from "../../../core/application/controllers/organization/user-controller";
import { UuidService } from "../../../core/application/gateways/uuid-service";
import { UserRepository } from "../../../core/application/repositories/user-repository";
import { InvalidJsonError } from "../../../core/domain/errors/invalid-json-error";
import { ApiResponse } from "../../../core/domain/models/routes/api-response";
import { Request } from "../../../core/domain/models/routes/request";
import { User } from "../../../core/domain/models/user";
import { userValidator } from "../../../utils/validators/user-validator";
import { UserNotFoundError } from "../../../core/domain/errors/user-not-found-error";

export class UserControllerImpl implements UserController {
  private readonly userRepository: UserRepository;
  private readonly uuidService: UuidService;

  constructor(args: { userRepository: UserRepository; uuidService: UuidService }) {
    this.userRepository = args.userRepository;
    this.uuidService = args.uuidService;
  }

  async put(req: Request, res: ApiResponse): Promise<void> {
    if (req.authorization.user === undefined) {
      res.status = 401;
      res.body = { message: "Unauthorized" };
    } else {
      if (req.authorization.user.permissions.manageUsers) {
        try {
          const body = (await req.json()) as { user: User };
          const validUser = await userValidator.validate(body.user);
          const user = await this.userRepository.update(validUser, req.authorization.user.organization.id);
          res.status = 200;
          res.body = { user };
        } catch (e) {
          if (e instanceof InvalidJsonError) {
            res.status = 400;
            res.body = { message: "Invalid JSON" };
          } else if (e instanceof ValidationError) {
            res.status = 400;
            res.body = { message: e.errors.join(", ") };
          } else if (e instanceof UserNotFoundError) {
            res.status = 400;
            res.body = { message: "User not found" };
          } else {
            throw e;
          }
        }
      } else {
        res.status = 403;
        res.body = { message: "Forbidden" };
      }
    }
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    if (req.authorization.user === undefined) {
      res.status = 401;
      res.body = { message: "Unauthorized" };
    } else {
      if (req.authorization.user.permissions.manageUsers) {
        try {
          const body = (await req.json()) as { user: User };
          const userId = this.uuidService.generateV7();
          const userPassword = this.uuidService.generateV7();
          const permissionId = this.uuidService.generateV7();

          body.user = {
            ...body.user,
            id: userId,
            organization: req.authorization.user.organization,
            permissions: { id: permissionId, manageUsers: false },
          };
          const validUser = await userValidator.validate(body.user);
          try {
            await this.userRepository.findByEmail(validUser.email);
            res.status = 400;
            res.body = { message: "User already exists" };
          } catch (e) {
            if (!(e instanceof UserNotFoundError)) {
              throw e;
            } else {
              validUser.password = userPassword;
              const user = await this.userRepository.create(validUser);
              res.status = 201;
              res.body = { user };
            }
          }
        } catch (e) {
          if (e instanceof InvalidJsonError) {
            res.status = 400;
            res.body = { message: "Invalid JSON" };
          } else if (e instanceof ValidationError) {
            res.status = 400;
            res.body = { message: e.errors.join(", ") };
          } else {
            throw e;
          }
        }
      } else {
        res.status = 403;
        res.body = { message: "Forbidden" };
      }
    }
  }
}
