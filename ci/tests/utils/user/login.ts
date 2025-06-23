import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { AuthService } from "@/app/_lib/core/application/gateways/auth-service";
import { AuthToken } from "@/app/_lib/core/domain/models/authentication/AuthToken";
import { User } from "@/app/_lib/core/domain/models/user";

export type CiAuthToken = AuthToken<User> & { ci: { token: string } };

export const login = async (): Promise<CiAuthToken> => {
  const body = {
    email: "email@domain.com",
    password: "12345678aA",
  };
  const token = await dependencyContainer.get<AuthService>("AuthService").login(body.email, body.password);
  const authToken = await dependencyContainer.get<AuthService>("AuthService").verifyToken(token);

  return { ...authToken, ci: { token } };
};
