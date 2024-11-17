import { organizationValidator } from "./organizationValidator";
import { Organization } from "../../core/domain/models/organization";
import { ValidationError } from "yup";

describe("organizationValidator", () => {
  it("should validate a valid organization", async () => {
    const validOrganization: Organization = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Valid Organization",
    };

    await expect(organizationValidator.validate(validOrganization)).resolves.toBe(validOrganization);
  });

  it("should throw a validation error for an invalid organization id", async () => {
    const invalidOrganization: Organization = {
      id: "invalid-uuid",
      name: "Invalid Organization",
    };

    await expect(organizationValidator.validate(invalidOrganization)).rejects.toThrow(ValidationError);
  });

  it("should throw a validation error for a missing organization name", async () => {
    const invalidOrganization: Partial<Organization> = {
      id: "123e4567-e89b-12d3-a456-426614174000",
    };

    await expect(organizationValidator.validate(invalidOrganization)).rejects.toThrow(ValidationError);
  });
});
