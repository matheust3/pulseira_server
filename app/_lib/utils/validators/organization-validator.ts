import { boolean, object, ObjectSchema, string } from "yup";
import { Organization } from "../../core/domain/models/organization";
import { uuidV7 } from "./uuid-v7-validator";

export const organizationValidator: ObjectSchema<Organization> = object({
  id: uuidV7.required(),
  name: string().required(),
  cnpj: string().matches(/^\d+$/, "cnpj must contain only numbers").required(),
  phone: string().matches(/^\d+$/, "phone must contain only numbers").required(),
  email: string().email().required(),
  address: string().required(),
  city: string().required(),
  state: string().required(),
  zip: string().matches(/^\d+$/, "zip must contain only numbers").required(),
  country: string().required(),
  isArchived: boolean().required(),
});
