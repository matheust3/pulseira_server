import { CepInfo } from "../../domain/models/location/cep-info";
import { City } from "../../domain/models/location/city";
import { State } from "../../domain/models/location/state";

export interface LocationService {
  getStates(): Promise<State[]>;
  getCities(stateId: string): Promise<City[]>;
  getCepInfo(cep: string): Promise<CepInfo>;
}
