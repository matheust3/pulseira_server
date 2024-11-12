import { JwtServiceImpl } from "./jwt-service-impl";
import * as jose from "jose";

describe("jwt-service-impl.test.ts - generateToken", () => {
  let sut: JwtServiceImpl;

  beforeAll(() => {
    process.env.JWT_SECRET = "secret";
    sut = new JwtServiceImpl();
  });

  test("ensure return a token", async () => {
    //! Arrange
    //! Act
    const token = await sut.generateToken({ id: "1" }, "1h");
    //! Assert
    expect(token).toBeDefined();
  });

  test("ensure throws if jwt throws", async () => {
    //! Arrange
    const mock = jest.spyOn(jose, "SignJWT").mockImplementationOnce(() => {
      throw new Error("test");
    });
    //! Act
    //! Assert
    expect(sut.generateToken({ id: "1" }, "1h")).rejects.toThrow("test");
    mock.mockRestore();
  });
});

describe("jwt-service-impl.test.ts - validateToken", () => {
  let sut: JwtServiceImpl;

  beforeAll(() => {
    process.env.JWT_SECRET = "secret";
    sut = new JwtServiceImpl();
  });

  test("ensure validate and return payload correct", async () => {
    //! Arrange
    const token = await sut.generateToken({ id: "1" }, "1h");
    //! Act
    const payload = await sut.validateToken(token);
    //! Assert
    expect(payload).toEqual({
      id: "1",
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });
});
