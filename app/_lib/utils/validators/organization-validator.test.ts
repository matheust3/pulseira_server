import { organizationValidator } from "./organization-validator";
import { Organization } from "../../core/domain/models/organization";
import { ValidationError } from "yup";

describe("organizationValidator", () => {
  let organization: Organization;

  beforeEach(() => {
    organization = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      city: "org city",
      address: "org address",
      cnpj: "00000000000111",
      country: "brazil",
      email: "org@domain.com",
      name: "org name",
      phone: "65999216704",
      state: "mt",
      zip: "78455000",
      isArchived: false,
    };
  });

  it("should validate a valid organization", async () => {
    const validOrganization: Organization = organization;

    await expect(organizationValidator.validate(validOrganization)).resolves.toBe(validOrganization);
  });

  it("should throw a validation error for an invalid organization id", async () => {
    const invalidOrganization: Organization = {
      ...organization,
      id: "invalid-uuid",
      name: "Invalid Organization",
    };

    await expect(organizationValidator.validate(invalidOrganization)).rejects.toThrow(ValidationError);
  });

  it("should throw a validation error for an invalid cnpj", async () => {
    const invalidOrganization: Organization = {
      ...organization,
      cnpj: "invalid-cnpj",
    };

    await expect(organizationValidator.validate(invalidOrganization)).rejects.toThrow(ValidationError);
  });

  it("should throw a validation error for an invalid phone", async () => {
    const invalidOrganization: Organization = {
      ...organization,
      phone: "invalid-phone",
    };

    await expect(organizationValidator.validate(invalidOrganization)).rejects.toThrow(ValidationError);
  });

  it("should throw a validation error for an invalid zip", async () => {
    const invalidOrganization: Organization = {
      ...organization,
      zip: "invalid-zip",
    };

    await expect(organizationValidator.validate(invalidOrganization)).rejects.toThrow(ValidationError);
  });
});
