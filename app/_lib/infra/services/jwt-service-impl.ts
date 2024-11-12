import { JwtService } from "../../core/application/gateways/jwt-service";
import * as jose from "jose";

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

  async validateToken(token: string): Promise<object> {
    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      algorithms: ["HS512"],
    });
    const data = {
      ...(payload.data as object),
      iat: payload.iat,
      exp: payload.exp,
    };
    return data;
  }
}
