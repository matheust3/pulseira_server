import { emailValidator } from "./email-validator";

describe("email-validator.test.ts - validator", () => {
  test("ensure string is a valid email", async () => {
    //! Arrange
    const validEmail = "test@example.com";

    //! Act
    const result = await emailValidator.isValid(validEmail);

    //! Assert
    expect(result).toBe(true);
  });

  test("ensure string is an invalid email", async () => {
    //! Arrange
    const invalidEmail = "invalid-email";

    //! Act
    const result = await emailValidator.isValid(invalidEmail);

    //! Assert
    expect(result).toBe(false);
  });

  test("ensure empty string is invalid", async () => {
    //! Arrange
    const emptyEmail = "";

    //! Act
    const result = await emailValidator.isValid(emptyEmail);

    //! Assert
    expect(result).toBe(false);
  });
});
