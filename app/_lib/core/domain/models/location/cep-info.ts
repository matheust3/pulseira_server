import { City } from "./city";
import { State } from "./state";

export type CepInfo = {
  cep: string;
  state: State;
  city: City;
  neighborhood: string;
  street: string;
};
