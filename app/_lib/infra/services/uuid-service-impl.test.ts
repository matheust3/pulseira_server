import { UuidServiceImpl } from "./uuid-service-impl";

describe("uuid-service-impl.test.ts - generateV7", () => {
  let sut: UuidServiceImpl;

  beforeEach(() => {
    sut = new UuidServiceImpl();
  });

  test("ensure return a uuid v7", async () => {
    //! Arrange
    //! Act
    const result = sut.generateV7();
    //! Assert
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
