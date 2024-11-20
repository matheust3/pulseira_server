import { JwtService } from "../../core/application/gateways/jwt-service";
import * as jose from "jose";
import { AuthToken } from "../../core/domain/models/authentication/AuthToken";

export class JwtServiceImpl implements JwtService {
  async generateToken(payload: object, expiresIn: string): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const jwt = await new jose.SignJWT({ data: payload })
      .setProtectedHeader({ alg: "HS512" })
      .setIssuedAt()
      .setIssuer(process.env.JWT_ISSUER)
      .setAudience(process.env.JWT_AUDIENCE)
      .setExpirationTime(expiresIn)
      .sign(secret);

    return jwt;
  }

  async validateToken<T>(token: string): Promise<AuthToken<T>> {
    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithms: ["HS512"],
    });
    if (!payload) {
      throw new Error("Invalid token");
    } else if (payload.iat === undefined || payload.exp === undefined) {
      throw new Error("Invalid token");
    } else {
      const data = {
        data: payload.data as T,
        iat: payload.iat,
        exp: payload.exp,
      };
      return data;
    }
  }

  async generateRefreshToken(token: string, expiresIn: string): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithms: ["HS512"],
    });

    const jwt = await new jose.SignJWT({ data: payload.data })
      .setProtectedHeader({ alg: "HS512" })
      .setIssuedAt()
      .setIssuer(process.env.JWT_ISSUER)
      .setAudience(process.env.JWT_AUDIENCE)
      .setExpirationTime(expiresIn)
      .sign(secret);

    return jwt;
  }
}
