import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { v7 } from "uuid";

export const createUser = async (db: PrismaClient): Promise<User> => {
  const hashedPassword = await bcrypt.hash("12345678aA", 10);
  const userId = v7();
  const organizationId = v7();
  const permissionsId = v7();
  return await db.user.create({
    data: {
      id: userId,
      email: "email@domain.com",
      name: "name",
      phone: "65999216704",
      password: hashedPassword,
      isArchived: false,
      organization: {
        create: {
          id: organizationId,
          name: "organization name",
          address: "organization address",
          state: "organization state",
          city: "organization city",
          cnpj: "18965831000163",
          isArchived: false,
          country: "organization country",
          phone: "65999216704",
          zip: "78455000",
          email: "organization@email.com",
        },
      },
      passwordReset: false,
      permissions: {
        create: {
          id: permissionsId,
          manageOrganization: true,
          manageUsers: true,
          manageOrganizations: true,
        },
      },
    },
  });
};
