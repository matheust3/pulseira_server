import { AuthService } from "../../core/application/gateways/auth-service";
import { JwtService } from "../../core/application/gateways/jwt-service";
import { UserRepository } from "../../core/application/repositories/user-repository";
import bcrypt from "bcrypt";

export class AuthServiceImpl implements AuthService {
  private readonly userRepository: UserRepository;
  private readonly jwtService: JwtService;

  constructor(args: { userRepository: UserRepository; jwtService: JwtService }) {
    this.userRepository = args.userRepository;
    this.jwtService = args.jwtService;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email, { withPassHash: true });
    if (user.password !== undefined) {
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
