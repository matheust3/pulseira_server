export interface Organization {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isArchived: boolean;
}

export const organizationKeys: (keyof Organization)[] = [
  "id",
  "name",
  "cnpj",
  "phone",
  "email",
  "address",
  "city",
  "state",
  "zip",
  "country",
  "isArchived",
];
