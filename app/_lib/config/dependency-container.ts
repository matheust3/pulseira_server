import { Resend } from "resend";
import { prisma } from "../infra/db/prisma-client";
import { PrismaClient } from "@prisma/client";
import { UuidService } from "../core/application/gateways/uuid-service";
import { UuidServiceImpl } from "../infra/services/uuid-service-impl";
import { JwtService } from "../core/application/gateways/jwt-service";
import { JwtServiceImpl } from "../infra/services/jwt-service-impl";
import { GetEmailTokenRateLimiter } from "../../../middlewares";
import { LoginRateLimiter } from "../../../middlewares/login-rate-limiter";
import { RecoverPasswordRateLimiter } from "../../../middlewares/recover-password-rate-limiter";
import { ResendEmailProvider } from "../infra/gateways/resend-email-provider";
import { EmailProvider } from "../core/application/gateways/external/email-provider";
import { MemoryDB } from "../infra/db/memory-db";
import { DevicesRepository } from "../core/application/repositories/devices-repository";
import { DevicesRepositoryImpl } from "../infra/repositories/devices-repository-impl";

type Factory<T> = () => T;

export class DependencyContainer {
  // eslint-disable-next-line no-use-before-define
  private static instance: DependencyContainer;
  private factories = new Map<string, Factory<unknown>>();
  private instances = new Map<string, unknown>();

  public define<T>(key: string, factory: Factory<T>): void {
    if (!this.factories.has(key)) {
      this.factories.set(key, factory);
    }
  }

  public get<T>(key: string): T {
    if (!this.instances.has(key)) {
      const factory = this.factories.get(key);
      if (!factory) {
        throw new Error(`Dependency ${key} not found`);
      }
      const instance = factory();
      this.instances.set(key, instance);
    }
    return this.instances.get(key) as T;
  }

  private constructor() {
    // Databases
    this.define<MemoryDB>("MemoryDB", () => new MemoryDB());

    this.define<PrismaClient>("PrismaClient", () => prisma);
    this.define<Resend>("Resend", () => new Resend(process.env.RESEND_API_KEY));
    // Services
    this.define<UuidService>("UuidService", () => new UuidServiceImpl());
    this.define<JwtService>("JwtService", () => new JwtServiceImpl());

    // Gateways
    this.define<EmailProvider>("EmailProvider", () => new ResendEmailProvider(this.get<Resend>("Resend")));

    // Middlewares
    this.define<GetEmailTokenRateLimiter>("GetEmailTokenRateLimiter", () => new GetEmailTokenRateLimiter());
    this.define<LoginRateLimiter>("LoginRateLimiter", () => new LoginRateLimiter());
    this.define<RecoverPasswordRateLimiter>("RecoverPasswordRateLimiter", () => new RecoverPasswordRateLimiter());
    this.define<GetEmailTokenRateLimiter>("GetEmailTokenRateLimiter", () => new GetEmailTokenRateLimiter());

    // Repositories
    this.define<DevicesRepository>(
      "DevicesRepository",
      () => new DevicesRepositoryImpl(this.get<MemoryDB>("MemoryDB")),
    );
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }
}

export const dependencyContainer = DependencyContainer.getInstance();
