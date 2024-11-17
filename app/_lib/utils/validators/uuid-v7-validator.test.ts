import { uuidV7 } from "./uuid-v7-validator";

describe("uuidV7 Validator", () => {
  it("should validate a correct UUID v7", () => {
    const validUuidV7 = "123e4567-e89b-7d3a-89ab-1234567890ab";
    expect(uuidV7.isValidSync(validUuidV7)).toBe(true);
  });

  it("should invalidate an incorrect UUID v7", () => {
    const invalidUuidV7 = "123e4567-e89b-6d3a-89ab-1234567890ab"; // Invalid version
    expect(uuidV7.isValidSync(invalidUuidV7)).toBe(false);
  });

  it("should invalidate a malformed UUID", () => {
    const malformedUuid = "123e4567-e89b-7d3a-89ab-1234567890"; // Too short
    expect(uuidV7.isValidSync(malformedUuid)).toBe(false);
  });
});
