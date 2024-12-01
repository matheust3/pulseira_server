import { PrismaClient } from "@prisma/client";
import { LocationService } from "../../core/application/gateways/location-service";
import { CepInfo } from "../../core/domain/models/location/cep-info";
import { City } from "../../core/domain/models/location/city";
import { State, stateKeys } from "../../core/domain/models/location/state";
import { pick } from "lodash";

export class LocationServiceImpl implements LocationService {
  private readonly prismaClient: PrismaClient;

  constructor(args: { prismaClient: PrismaClient }) {
    this.prismaClient = args.prismaClient;
  }

  async getStates(): Promise<State[]> {
    const states = await this.prismaClient.state.findMany();
    return states.map((state) => pick(state, stateKeys));
  }

  getCities(stateId: string): Promise<City[]> {
    throw new Error("Method not implemented." + stateId);
  }

  getCepInfo(cep: string): Promise<CepInfo> {
    throw new Error("Method not implemented." + cep);
  }
}
