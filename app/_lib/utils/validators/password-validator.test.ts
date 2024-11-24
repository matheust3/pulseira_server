import { passwordValidator } from "./password-validator";

describe("passwordValidator", () => {
  it("should validate a password with at least one uppercase letter, one lowercase letter, one number, and at least 8 characters long", () => {
    const validPassword = "Password1";
    expect(passwordValidator.isValidSync(validPassword)).toBe(true);
  });

  it("should invalidate a password without an uppercase letter", () => {
    const invalidPassword = "password1";
    expect(passwordValidator.isValidSync(invalidPassword)).toBe(false);
  });

  it("should invalidate a password without a lowercase letter", () => {
    const invalidPassword = "PASSWORD1";
    expect(passwordValidator.isValidSync(invalidPassword)).toBe(false);
  });

  it("should invalidate a password without a number", () => {
    const invalidPassword = "Password";
    expect(passwordValidator.isValidSync(invalidPassword)).toBe(false);
  });

  it("should invalidate a password with less than 8 characters", () => {
    const invalidPassword = "Pass1";
    expect(passwordValidator.isValidSync(invalidPassword)).toBe(false);
  });

  it("should invalidate a password containing spaces", () => {
    const invalidPassword = "Pass word1";
    expect(passwordValidator.isValidSync(invalidPassword)).toBe(false);
  });
});
