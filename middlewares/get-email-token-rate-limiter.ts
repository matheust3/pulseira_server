import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Middleware } from "@/app/_lib/core/domain/models/routes/middleware";
import { Request } from "@/app/_lib/core/domain/models/routes/request";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

export class GetEmailTokenRateLimiter implements Middleware {
  private readonly rateLimiterLow: RateLimiterMemory;
  private readonly rateLimiterHight: RateLimiterMemory;
  private readonly dailyRateLimiter: RateLimiterMemory;

  constructor() {
    this.rateLimiterLow = new RateLimiterMemory({
      points: 5,
      duration: 15,
    });
    this.rateLimiterHight = new RateLimiterMemory({
      points: 120,
      duration: 3600,
    });
    this.dailyRateLimiter = new RateLimiterMemory({
      points: 30,
      duration: 86400, // 24 hours in seconds
    });
  }

  async handler(request: Request, response: ApiResponse, next: () => void): Promise<void> {
    try {
      // Se for a rota verify
      if (request.url.pathname.includes("verify")) {
        // A logica de consumo de pontos é diferente
        // Se for a rota verify, o consumo é feito pelo email
        let json: { email?: string; token?: string } = {};
        try {
          json = (await request.json()) as typeof json;
        } catch (error) {
          response.body = { error: "Invalid JSON" };
          response.status = 400;
        }

        if (json.email === undefined) {
          response.body = { error: "Email is required" };
          response.status = 400;
        } else {
          await this.rateLimiterLow.consume(json.email, 1, {});
          await this.dailyRateLimiter.consume(json.email, 1, {});
          next();
        }
      } else {
        await this.rateLimiterLow.consume(request.remoteAddress.ip ?? "no-ip", 1, {});
        await this.rateLimiterHight.consume(request.remoteAddress.ip ?? "no-ip", 1, {});
        await this.dailyRateLimiter.consume(request.remoteAddress.ip ?? "no-ip", 1, {});
        next();
      }
    } catch (e) {
      if (e instanceof RateLimiterRes) {
        response.body = { error: "Too many requests" };
        response.status = 429;
        response.headers.set("Retry-After", Math.ceil(e.msBeforeNext / 1000).toString());
        response.headers.set("X-RateLimit-Limit", "5");
        response.headers.set("X-RateLimit-Remaining", e.remainingPoints.toString());
        response.headers.set("X-RateLimit-Reset", (e.msBeforeNext / 1000).toFixed(0).toString());
      } else {
        response.body = { error: "Internal server error" };
        response.status = 500;
        console.error(e);
      }
    }
  }
}
