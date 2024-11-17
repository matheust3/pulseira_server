import { userPermissionsValidator } from "./user-permissions-validator";

describe("userPermissionsValidator", () => {
  it("should validate a valid permissions object", async () => {
    const validPermissions = {
      id: "123e4567-e89b-12d3-a456-426614174001", // Example UUID v7
      manageUsers: true,
    };

    await expect(userPermissionsValidator.validate(validPermissions)).resolves.toBe(validPermissions);
  });

  it("should fail validation for missing id", async () => {
    const invalidPermissions = {
      manageUsers: true,
    };

    await expect(userPermissionsValidator.validate(invalidPermissions)).rejects.toThrow();
  });

  it("should fail validation for invalid id format", async () => {
    const invalidPermissions = {
      id: "invalid-uuid",
      manageUsers: true,
    };

    await expect(userPermissionsValidator.validate(invalidPermissions)).rejects.toThrow();
  });

  it("should fail validation for missing manageUsers", async () => {
    const invalidPermissions = {
      id: "018e4567-e89b-12d3-a456-426614174000", // Example UUID v7
    };

    await expect(userPermissionsValidator.validate(invalidPermissions)).rejects.toThrow();
  });

  it("should fail validation for non-boolean manageUsers", async () => {
    const invalidPermissions = {
      id: "018e4567-e89b-12d3-a456-426614174000", // Example UUID v7
      manageUsers: "yes",
    };

    await expect(userPermissionsValidator.validate(invalidPermissions)).rejects.toThrow();
  });
});
