import { AuthService } from "../core/application/gateways/auth-service";
import { JwtService } from "../core/application/gateways/jwt-service";
import { UserRepository } from "../core/application/repositories/user-repository";
import { AuthServiceImpl } from "../infra/services/auth-service-impl";
import { JwtServiceImpl } from "../infra/services/jwt-service-impl";

export class LoadServices {
  private readonly _authService: AuthService;
  public get authService(): AuthService {
    return this._authService;
  }

  private readonly _jwtService: JwtService;
  public get jwtService(): JwtService {
    return this._jwtService;
  }

  constructor(args: { userRepository: UserRepository }) {
    // Load services
    this._jwtService = new JwtServiceImpl();
    this._authService = new AuthServiceImpl({ jwtService: this._jwtService, userRepository: args.userRepository });
  }
}
