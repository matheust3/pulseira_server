import { AuthService } from "../../core/application/gateways/auth-service";
import { JwtService } from "../../core/application/gateways/jwt-service";
import { UserRepository } from "../../core/application/repositories/user-repository";
import bcrypt from "bcrypt";
import { UnauthorizedError } from "../../core/domain/errors/unauthorized-error";
import { AuthToken } from "../../core/domain/models/authentication/AuthToken";
import { User } from "../../core/domain/models/user";
import { ForbiddenError } from "../../core/domain/errors/forbidden-error";

export class AuthServiceImpl implements AuthService {
  private readonly userRepository: UserRepository;
  private readonly jwtService: JwtService;

  constructor(args: { userRepository: UserRepository; jwtService: JwtService }) {
    this.userRepository = args.userRepository;
    this.jwtService = args.jwtService;
  }

  async verifyToken(token: string): Promise<AuthToken<User>> {
    try {
      return await this.jwtService.validateToken(token);
    } catch (error) {
      throw new UnauthorizedError();
    }
  }

  async regenerateToken(token: string): Promise<string> {
    try {
      return await this.jwtService.generateRefreshToken(token, "4h");
    } catch (error) {
      throw new UnauthorizedError();
    }
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email, { withPassHash: true });
    if (user.isArchived) {
      throw new ForbiddenError();
    } else if (user.password !== undefined) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      } else {
        delete user.password; // Remove password before encoding user as payload
        const token = await this.jwtService.generateToken(user, "4h");
        return token;
      }
    } else {
      throw new Error("Invalid password");
    }
  }
}
