import { PrismaClient } from "@prisma/client";

export const clearDb = async (db: PrismaClient): Promise<void> => {
  await db.permissions.deleteMany();
  await db.user.deleteMany();
  await db.organization.deleteMany();
};
