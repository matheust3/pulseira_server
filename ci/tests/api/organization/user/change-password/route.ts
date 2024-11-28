import { clearDb } from "@/ci/tests/utils/db";
import { CiAuthToken, createUser, login } from "@/ci/tests/utils/user";
import { PrismaClient } from "@prisma/client";

describe("route.spec.ts - post", () => {
  let db: PrismaClient;
  let token: CiAuthToken;

  beforeAll(async () => {
    db = new PrismaClient();
    await clearDb(db);
  });

  beforeEach(async () => {
    await clearDb(db);
    await createUser(db);
    token = await login();
  });

  afterAll(async () => {
    await clearDb(db);
  });

  test("ensure return 401 if not authenticated", async () => {
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user/change-password", {
      method: "POST",
    });
    //! Assert
    expect(response.status).toBe(401);
  });

  test("ensure return 400 if body is empty", async () => {
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user/change-password", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    //! Assert
    expect(response.status).toBe(400);
  });
});
