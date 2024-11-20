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
      data: { id: "1" },
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });
});

describe("jwt-service-impl.test.ts - generateRefreshToken", () => {
  let sut: JwtServiceImpl;

  beforeAll(() => {
    process.env.JWT_SECRET = "secret";
    sut = new JwtServiceImpl();
  });

  test("ensure return a refresh token", async () => {
    //! Arrange
    const token = await sut.generateToken({ id: "1" }, "1h");
    //! Act
    const refreshToken = await sut.generateRefreshToken(token, "2h");
    //! Assert
    expect(refreshToken).toBeDefined();
  });

  test("ensure throws if token to refresh is invalid", async () => {
    //! Arrange
    const token = await sut.generateToken({ id: "1" }, "1h");
    const mock = jest.spyOn(jose, "jwtVerify").mockImplementationOnce(() => {
      throw new Error("test");
    });
    //! Act
    //! Assert
    expect(sut.generateRefreshToken(token, "2h")).rejects.toThrow("test");
    mock.mockRestore();
  });

  test("ensure refreshed token payload is same as original token", async () => {
    //! Arrange
    const originalToken = await sut.generateToken({ id: "1" }, "1h");
    const originalPayload = await sut.validateToken<{ id: string }>(originalToken);
    //! Act
    const refreshToken = await sut.generateRefreshToken(originalToken, "2h");
    const refreshedPayload = await sut.validateToken<{ id: string }>(refreshToken);
    //! Assert
    expect(originalPayload.data).toEqual(refreshedPayload.data);
  });
});
