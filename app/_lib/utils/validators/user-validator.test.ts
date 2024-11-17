import { userValidator } from "./user-validator";
import { organizationValidator } from "./organizationValidator";
import { userPermissionsValidator } from "./userPermissionsValidator";

describe("userValidator", () => {
  it("should validate a valid user", async () => {
    const validUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
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
    };

    await expect(userValidator.validate(validUser)).resolves.toBe(validUser);
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
      id: "123e4567-e89b-12d3-a456-426614174000",
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
    };

    await expect(userValidator.validate(invalidUser)).rejects.toThrow();
  });

  // Add more tests as needed
});
