import { userValidator } from "./user-validator";
import { organizationValidator } from "./organization-validator";
import { userPermissionsValidator } from "./user-permissions-validator";

describe("userValidator", () => {
  it("should validate a valid user", async () => {
    const validUser = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      email: "test@example.com",
      phone: "+1234567890",
      password: "password123",
      name: "John Doe",
      organization: await organizationValidator.validate({
        id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
        name: "OrgName",
      }),
      permissions: await userPermissionsValidator.validate({
        id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
        manageUsers: true,
      }),
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
      organization: await organizationValidator.validate({
        id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
        name: "OrgName",
      }),
      permissions: await userPermissionsValidator.validate({
        id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
        manageUsers: true,
      }),
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
      organization: await organizationValidator.validate({
        id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
        name: "OrgName",
      }),
      permissions: await userPermissionsValidator.validate({
        id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
        manageUsers: true,
      }),
      isArchived: false,
    };

    await expect(userValidator.validate(validUser)).rejects.toThrow();
  });

  it("should invalidate a user with missing required fields", async () => {
    const invalidUser = {
      email: "test@example.com",
      name: "John Doe",
      organization: await organizationValidator.validate({
        id: "123e4567-e89b-12d3-a456-426614174001",
        name: "OrgName",
      }),
      permissions: await userPermissionsValidator.validate({
        id: "123e4567-e89b-12d3-a456-426614174002",
        manageUsers: true,
      }),
    };

    await expect(userValidator.validate(invalidUser)).rejects.toThrow();
  });

  it("should invalidate a user with invalid email", async () => {
    const invalidUser = {
      id: "123e4567-e89b-7d3a-a456-426614174000",
      email: "invalid-email",
      password: "password123",
      name: "John Doe",
      organization: await organizationValidator.validate({
        id: "123e4567-e89b-12d3-a456-426614174001",
        name: "OrgName",
      }),
      permissions: await userPermissionsValidator.validate({
        id: "123e4567-e89b-12d3-a456-426614174002",
        manageUsers: true,
      }),
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
      organization: await organizationValidator.validate({
        id: "123e4567-e89b-12d3-a456-426614174001",
        name: "OrgName",
      }),
      permissions: await userPermissionsValidator.validate({
        id: "123e4567-e89b-12d3-a456-426614174002",
        manageUsers: true,
      }),
      isArchived: "not-a-boolean",
    };

    await expect(userValidator.validate(invalidUser)).rejects.toThrow();
  });

  // Add more tests as needed
});
