import { User } from "@/app/_lib/core/domain/models/user";
import { clearDb } from "@/ci/tests/utils/db";
import { CiAuthToken, createUser, login } from "@/ci/tests/utils/user";
import { PrismaClient } from "@prisma/client";
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

describe("route.spec.ts - put", () => {
  let db: PrismaClient;
  let token: CiAuthToken;
  let validUser: User;

  beforeAll(async () => {
    db = new PrismaClient();
    await clearDb(db);
  });

  beforeEach(async () => {
    await clearDb(db);
    await createUser(db);
    token = await login();

    validUser = {
      id: v7(),
      email: "user2@domain.com",
      password: "password1F",
      isArchived: false,
      name: "User 2",
      phone: "123456789",
      permissions: {
        id: v7(),
        manageOrganization: false,
        manageOrganizations: false,
        manageUsers: false,
      },
      organization: token.data.organization,
    };
  });

  afterAll(async () => {
    await clearDb(db);
  });

  test("ensure return 401 if not authenticated", async () => {
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "PUT",
    });
    //! Assert
    expect(response.status).toBe(401);
  });

  test("ensure return 403 if not has permission", async () => {
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
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: JSON.stringify({ user: validUser }),
    });
    //! Assert
    expect(response.status).toBe(403);
  });

  test("ensure return 400 if invalid json", async () => {
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
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: "invalid json",
    });
    //! Assert
    expect(response.status).toBe(400);
  });

  test("ensure return 400 if invalid user", async () => {
    //! Arrange
    validUser.email = "invalid email";
    const body = { user: validUser };
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(400);
  });

  test("ensure return 404 if valid user not exists", async () => {
    //! Arrange
    const body = { user: validUser };
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    //! Assert
    expect(response.status).toBe(404);
    expect(json.message).toBe("User not found");
  });

  test("ensure update user if has permission", async () => {
    //! Arrange
    const body = { user: validUser };
    await db.user.create({
      data: {
        ...validUser,
        password: "password1F",
        organization: {
          connect: { id: token.data.organization.id },
        },
        permissions: { create: { ...validUser.permissions } },
      },
    });
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(200);
  });

  test("ensure update user if is itself and not manageUsers", async () => {
    //! Arrange
    const body = { user: token.data };
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: false } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(200);
  });

  test("ensure that the user cannot assign the permission to manage other users to themselves if they do not have this permission", async () => {
    //! Arrange
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: false } },
      },
    });
    token = await login();
    const body = { user: { ...token.data, permissions: { ...token.data.permissions, manageUsers: true } } };
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(200);
    const userUpdated = await db.user.findUnique({ where: { id: token.data.id }, include: { permissions: true } });
    expect(userUpdated?.permissions?.manageUsers).toBe(false);
  });

  test("ensure that the user cannot assign the permission to manage other organizations if they do not have this permission", async () => {
    //! Arrange
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    await db.user.create({
      data: {
        ...validUser,
        password: "password1F",
        organization: {
          connect: { id: token.data.organization.id },
        },
        permissions: { create: { ...validUser.permissions, manageOrganizations: false } },
      },
    });
    const body = { user: { ...validUser, permissions: { ...validUser.permissions, manageOrganizations: true } } };
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(200);
    const userUpdated = await db.user.findUnique({ where: { id: validUser.id }, include: { permissions: true } });
    expect(userUpdated?.permissions?.manageOrganizations).toBe(false);
  });

  test("ensure that the user cannot change the permission to manage other organizations if they do not have this permission", async () => {
    //! Arrange
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    await db.user.create({
      data: {
        ...validUser,
        password: "password1F",
        organization: {
          connect: { id: token.data.organization.id },
        },
        permissions: { create: { ...validUser.permissions, manageOrganizations: true } },
      },
    });
    const body = { user: { ...validUser, permissions: { ...validUser.permissions, manageOrganizations: false } } };
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
      body: JSON.stringify(body),
    });
    //! Assert
    expect(response.status).toBe(200);
    const userUpdated = await db.user.findUnique({ where: { id: validUser.id }, include: { permissions: true } });
    expect(userUpdated?.permissions?.manageOrganizations).toBe(true);
  });
});

describe("route.spec.ts - post", () => {
  let db: PrismaClient;
  let token: CiAuthToken;
  let validUser: User;

  beforeAll(async () => {
    db = new PrismaClient();
    await clearDb(db);
  });

  beforeEach(async () => {
    await clearDb(db);
    await createUser(db);
    token = await login();

    validUser = {
      id: v7(),
      email: "user2@domain.com",
      password: "password1F",
      isArchived: false,
      name: "User 2",
      phone: "123456789",
      permissions: {
        id: v7(),
        manageOrganization: false,
        manageOrganizations: false,
        manageUsers: false,
      },
      organization: token.data.organization,
    };
  });

  afterAll(async () => {
    await clearDb(db);
  });

  test("ensure create a user on own organization if has permission", async () => {
    //! Arrange
    const body = { user: validUser };
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    //! Assert
    expect(response.status).toBe(201);
  });

  test("ensure not add permissions if not have", async () => {
    //! Arrange
    validUser.permissions.manageOrganization = true;
    validUser.permissions.manageOrganizations = true;
    validUser.permissions.manageUsers = true;
    const body = { user: validUser };
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    const json = await response.json();
    //! Assert
    expect(response.status).toBe(201);
    expect(json.user.permissions.manageOrganization).toBe(false);
    expect(json.user.permissions.manageOrganizations).toBe(false);
    expect(json.user.permissions.manageUsers).toBe(true);
  });
  test("ensure not create a user on own organization if no has permission", async () => {
    //! Arrange
    const body = { user: validUser };
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: true, manageOrganizations: true, manageUsers: false } },
      },
    });
    token = await login();
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    //! Assert
    expect(response.status).toBe(403);
  });
  test("ensure not create a user on another organization if no has permission", async () => {
    //! Arrange
    const body = { user: validUser };
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: true, manageOrganizations: false, manageUsers: true } },
      },
    });
    token = await login();
    const anotherOrganization = await db.organization.create({
      data: {
        ...token.data.organization,
        id: v7(),
        name: "Another Organization",
        isArchived: false,
        cnpj: "60143175000180",
      },
    });
    validUser.organization = anotherOrganization;
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    //! Assert
    expect(response.status).toBe(403);
  });

  test("ensure create a user on another organization if  has permission", async () => {
    //! Arrange
    const body = { user: validUser };
    await db.user.update({
      where: { id: token.data.id },
      data: {
        permissions: { update: { manageOrganization: false, manageOrganizations: true, manageUsers: true } },
      },
    });
    token = await login();
    const anotherOrganization = await db.organization.create({
      data: {
        ...token.data.organization,
        id: v7(),
        name: "Another Organization",
        isArchived: false,
        cnpj: "60143175000180",
      },
    });
    validUser.organization = anotherOrganization;
    //! Act
    const response = await fetch("http://localhost:3000/api/organization/user", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token.ci.token}`,
      },
    });
    const json = await response.json();
    //! Assert
    expect(response.status).toBe(201);
    expect(json.user.organization.id).toBe(validUser.organization.id);
    expect(json.user.organization.id).not.toBe(token.data.organization.id);
  });
});
