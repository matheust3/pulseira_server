export type State = {
  id: string;
  name: string;
  abbreviation: string;
};

export const stateKeys: (keyof State)[] = ["id", "name", "abbreviation"];
