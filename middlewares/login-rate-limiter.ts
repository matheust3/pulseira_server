import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Middleware } from "@/app/_lib/core/domain/models/routes/middleware";
import { Request } from "@/app/_lib/core/domain/models/routes/request";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

export class LoginRateLimiter implements Middleware {
  private readonly rateLimiter: RateLimiterMemory;

  constructor() {
    this.rateLimiter = new RateLimiterMemory({
      points: 1,
      duration: 1, // 1 second
    });
  }

  async handler(request: Request, response: ApiResponse, next: () => void): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      next();
      return;
    }
    try {
      await this.rateLimiter.consume(request.remoteAddress.ip ?? "no-ip", 1, {});
      next();
    } catch (e) {
      if (e instanceof RateLimiterRes) {
        response.body = { error: "Too many requests" };
        response.status = 429;
        response.headers.set("Retry-After", Math.ceil(e.msBeforeNext / 1000).toString());
        response.headers.set("X-RateLimit-Limit", "10");
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
