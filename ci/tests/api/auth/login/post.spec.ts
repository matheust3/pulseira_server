import { clearDb, createUser } from "@/ci/tests/utils/db";
import { PrismaClient } from "@prisma/client";

describe("get.test.ts - post method", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = new PrismaClient();
    await createUser(db);
  });

  afterAll(async () => {
    await clearDb(db);
    db.$disconnect();
  });

  test("ensure return 401 if data is invalid", async () => {
    //! Arrange
    const body = {
      anyField: "anyValue",
    };
    //! Act
    const response = await fetch("http://localhost:3000/api/auth/login", {
      body: JSON.stringify(body),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    //! Assert
    expect(response.status).toBe(401);
  });

  test("ensure return 401 if email or pass is invalid", async () => {
    //! Arrange
    const body = {
      email: "any@domain.com",
      password: "any",
    };
    //! Act
    const response = await fetch("http://localhost:3000/api/auth/login", {
      body: JSON.stringify(body),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    //! Assert
    expect(response.status).toBe(401);
  });

  test("ensure return 200 if email and pass is valid", async () => {
    //! Arrange
    const body = {
      email: "email@domain.com",
      password: "12345678aA",
    };
    //! Act
    const response = await fetch("http://localhost:3000/api/auth/login", {
      body: JSON.stringify(body),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    //! Assert
    expect(response.status).toBe(200);
  });
});
