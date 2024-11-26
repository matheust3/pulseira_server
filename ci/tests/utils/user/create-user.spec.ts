import { PrismaClient } from "@prisma/client";
import { createUser } from "../user/create-user";
import { clearDb } from "../db";

describe("create-user.ts - create user", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = new PrismaClient();
    await clearDb(db);
  });

  afterAll(async () => {
    await clearDb(db);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  test("ensure create a user in db", async () => {
    //! Arrange
    //! Act
    const createdUser = await createUser(db);
    //! Assert
    expect(createdUser).not.toBeNull();
  });
});
