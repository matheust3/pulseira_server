import { AuthService } from "../core/application/gateways/auth-service";
import { JwtService } from "../core/application/gateways/jwt-service";
import { UuidService } from "../core/application/gateways/uuid-service";
import { UserRepository } from "../core/application/repositories/user-repository";
import { AuthServiceImpl } from "../infra/services/auth-service-impl";
import { JwtServiceImpl } from "../infra/services/jwt-service-impl";
import { UuidServiceImpl } from "../infra/services/uuid-service-impl";

export class LoadServices {
  private readonly _authService: AuthService;
  public get authService(): AuthService {
    return this._authService;
  }

  private readonly _jwtService: JwtService;
  public get jwtService(): JwtService {
    return this._jwtService;
  }

  private readonly _uuidService: UuidService;
  public get uuidService(): UuidService {
    return this._uuidService;
  }

  constructor(args: { userRepository: UserRepository }) {
    // Load services
    this._jwtService = new JwtServiceImpl();
    this._authService = new AuthServiceImpl({ jwtService: this._jwtService, userRepository: args.userRepository });
    this._uuidService = new UuidServiceImpl();
  }
}
