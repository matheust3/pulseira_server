import { generatePassword } from "./password-generator";

describe("password-generator.test.ts - generatePassword", () => {
  test("ensure generate correct pass", async () => {
    //! Arrange
    //! Act
    const pass = generatePassword(8);
    //! Assert
    expect(pass).toHaveLength(8);
    expect(pass).toMatch(/^[a-zA-Z0-9]+$/);
  });
});
