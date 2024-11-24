import { PrismaClient } from "@prisma/client";
import { clearDb } from "../../utils/db";
import { CiAuthToken, createUser, login } from "../../utils/user";
import { Organization } from "@/app/_lib/core/domain/models/organization";
import { v7 } from "uuid";

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

  test("ensure return 401 if unauthorized", async () => {
    //! Arrange
    const invalidToken = "invalid token";
    //! Act
    const response = await fetch("http://localhost:3000/api/organization", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${invalidToken}`,
      },
    });
    //! Assert
    expect(response.status).toBe(401);
  });

  test("ensure return all organizations", async () => {
    //! Arrange
    //! Act
    const response = await fetch("http://localhost:3000/api/organization", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    const organizations = await response.json();
    //! Assert
    expect(response.status).toBe(200);
    expect(organizations).toHaveLength(1);
    expect(organizations[0].cnpj).toBe(token.data.organization.cnpj);
  });

  test("ensure return 403 if user not permited to manageorganizations", async () => {
    //! Arrange
    await db.user.update({
      where: { id: token.data.id },
      data: { permissions: { update: { manageOrganizations: false } } },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    //! Assert
    expect(response.status).toBe(403);
  });
});

describe("route.spec.ts - post", () => {
  let db: PrismaClient;
  let token: CiAuthToken;
  let validOrganization: Organization;

  beforeAll(async () => {
    db = new PrismaClient();
    await clearDb(db);
  });

  beforeEach(async () => {
    await clearDb(db);
    await createUser(db);
    token = await login();

    validOrganization = {
      name: "Organization Name",
      email: "org@email.com",
      phone: "123456789",
      address: "Organization Address",
      city: "Organization City",
      state: "Organization State",
      country: "Organization Country",
      zip: "123456",
      cnpj: "44084309000182",
      id: v7(),
      isArchived: false,
    };
  });

  afterAll(async () => {
    await clearDb(db);
  });

  test("ensure return 401 if unauthorized", async () => {
    //! Arrange
    const invalidToken = "invalid token";
    //! Act
    const response = await fetch("http://localhost:3000/api/organization", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${invalidToken}`,
      },
    });
    //! Assert
    expect(response.status).toBe(401);
  });

  test("ensure create a organization in db", async () => {
    //! Arrange
    const body = {
      organization: validOrganization,
    };
    //! Act
    const response = await fetch("http://localhost:3000/api/organization", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(201);
    const organization = await db.organization.findUnique({ where: { cnpj: validOrganization.cnpj } });
    expect(organization).not.toBeNull();
    expect(organization?.id).not.toBe(validOrganization.id);
  });

  test("ensure return 400 if organization already exists with same cnpj", async () => {
    //! Arrange
    const body = {
      organization: validOrganization,
    };
    await db.organization.create({ data: validOrganization });
    //! Act
    const response = await fetch("http://localhost:3000/api/organization", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(409);
  });

  test("ensure return 403 if user not permited to manageorganizations", async () => {
    //! Arrange
    const body = {
      organization: validOrganization,
    };
    await db.user.update({
      where: { id: token.data.id },
      data: { permissions: { update: { manageOrganizations: false } } },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(403);
  });
});
