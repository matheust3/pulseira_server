import { clearDb } from "@/ci/tests/utils/db";
import { CiAuthToken, createUser, login } from "@/ci/tests/utils/user";
import { PrismaClient } from "@prisma/client";

describe("route.spec.ts - get", () => {
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

  test("ensure get user if has permission", async () => {
    //! Arrange
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    //! Assert
    expect(response.status).toBe(200);
  });
  test("ensure not get user if no has permission", async () => {
    //! Arrange
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: false } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    //! Assert
    expect(response.status).toBe(403);
  });
});
