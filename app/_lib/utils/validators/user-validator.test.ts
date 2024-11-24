import { userValidator } from "./user-validator";
import { organizationValidator } from "./organization-validator";
import { userPermissionsValidator } from "./user-permissions-validator";
import { Organization } from "../../core/domain/models/organization";
import { Permissions } from "../../core/domain/models/permissions";

describe("userValidator", () => {
  let validOrganization: Organization;
  let validUserPermissions: Permissions;

  beforeEach(() => {
    validOrganization = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      name: "OrgName",
      cnpj: "00000000000111",
      phone: "65999216704",
      email: "email@domain.com",
      address: "org address",
      city: "org city",
      state: "mt",
      zip: "78455000",
      country: "brazil",
      isArchived: false,
    };

    validUserPermissions = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      manageUsers: true,
      manageOrganization: true,
      manageOrganizations: true,
    };
  });

  it("should validate a valid user", async () => {
    const validUser = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      email: "test@example.com",
      phone: "+1234567890",
      password: "password123",
      name: "John Doe",
      organization: await organizationValidator.validate(validOrganization),
      permissions: await userPermissionsValidator.validate(validUserPermissions),
      isArchived: false,
    };

    await expect(userValidator.validate(validUser)).resolves.toBe(validUser);
  });

  it("should phone be empty", async () => {
    const validUser = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      email: "test@example.com",
      phone: "",
      password: "password123",
      name: "John Doe",
      organization: await organizationValidator.validate(validOrganization),
      permissions: await userPermissionsValidator.validate(validUserPermissions),
      isArchived: false,
    };

    await expect(userValidator.validate(validUser)).resolves.toBe(validUser);
  });

  it("should phone not be null", async () => {
    const validUser = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      email: "test@example.com",
      phone: null,
      password: "password123",
      name: "John Doe",
      organization: await organizationValidator.validate(validOrganization),
      permissions: await userPermissionsValidator.validate(validUserPermissions),
      isArchived: false,
    };

    await expect(userValidator.validate(validUser)).rejects.toThrow();
  });

  it("should invalidate a user with missing required fields", async () => {
    const invalidUser = {
      email: "test@example.com",
      name: "John Doe",
      organization: await organizationValidator.validate(validOrganization),
      permissions: await userPermissionsValidator.validate(validUserPermissions),
    };

    await expect(userValidator.validate(invalidUser)).rejects.toThrow();
  });

  it("should invalidate a user with invalid email", async () => {
    const invalidUser = {
      id: "123e4567-e89b-7d3a-a456-426614174000",
      email: "invalid-email",
      password: "password123",
      name: "John Doe",
      organization: await organizationValidator.validate(validOrganization),
      permissions: await userPermissionsValidator.validate(validUserPermissions),
      isArchived: false,
    };

    await expect(userValidator.validate(invalidUser)).rejects.toThrow();
  });

  it("should invalidate a user with invalid isArchived value", async () => {
    const invalidUser = {
      id: "123e4567-e89b-7d3a-a456-426614174000",
      email: "test@example.com",
      password: "password123",
      name: "John Doe",
      organization: await organizationValidator.validate(validOrganization),
      permissions: await userPermissionsValidator.validate(validUserPermissions),
      isArchived: "not-a-boolean",
    };

    await expect(userValidator.validate(invalidUser)).rejects.toThrow();
  });

  // Add more tests as needed
});
