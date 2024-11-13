import { Resend } from "resend";
import { prisma } from "../infra/db/prisma-client";
import { LoadGateways } from "./load-gateways";
import { LoadMiddlewares } from "./load-middlewares";
import { LoadRepositories } from "./load-repositories";

export class DependencyContainer {
  // eslint-disable-next-line no-use-before-define
  private static instance: DependencyContainer;

  // Middleware
  private readonly loadMiddlewares: LoadMiddlewares;
  public get middlewares(): LoadMiddlewares {
    return this.loadMiddlewares;
  }

  // Repositories
  private readonly loadRepositories: LoadRepositories;
  public get repositories(): LoadRepositories {
    return this.loadRepositories;
  }

  // Gateways
  private readonly loadGateways: LoadGateways;
  public get gateways(): LoadGateways {
    return this.loadGateways;
  }

  private constructor() {
    this.loadMiddlewares = new LoadMiddlewares();

    // Load repositories
    this.loadRepositories = new LoadRepositories({ prismaClient: prisma });

    // Load gateways
    this.loadGateways = new LoadGateways({ emailProvider: new Resend(process.env.RESEND_API_KEY) });
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }
}

export const dependencyContainer = DependencyContainer.getInstance();
