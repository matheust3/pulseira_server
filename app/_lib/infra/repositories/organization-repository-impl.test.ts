import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { OrganizationRepositoryImpl } from "./organization-repository-impl";
import { PrismaClient, Organization as PrismaOrganization } from "@prisma/client";
import { Organization } from "../../core/domain/models/organization";
import { UuidService } from "../../core/application/gateways/uuid-service";

describe("organization-repository-impl.test.ts - create", () => {
  let prismaClient: DeepMockProxy<PrismaClient>;
  let uuidService: MockProxy<UuidService>;
  let sut: OrganizationRepositoryImpl;
  let organization: Organization;

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>();
    uuidService = mock<UuidService>();
    organization = {
      id: "emptId",
      name: "name",
      cnpj: "cnpj",
      phone: "phone",
      email: "email",
      address: "address",
      city: "city",
      state: "state",
      zip: "zip",
      country: "country",
      isArchived: false,
    };

    const uuid = "6a2f41a3-c54c-fce8-32d2-0324e1c32e22";
    uuidService.generateV7.mockReturnValue(uuid);
    prismaClient.organization.create.mockResolvedValue(mock<PrismaOrganization>({ ...organization, id: uuid }));

    sut = new OrganizationRepositoryImpl({ prismaClient, uuidService });
  });

  test("ensure create new organization correctly", async () => {
    //! Arrange
    uuidService.generateV7.mockReturnValue("another-uuid");
    const newOrganization = { ...organization, id: "another-uuid" };
    prismaClient.organization.create.mockResolvedValue(mock<PrismaOrganization>({ ...newOrganization }));
    //! Act
    const result = await sut.create(organization);
    //! Assert
    expect(uuidService.generateV7).toHaveBeenCalledTimes(1);
    expect(prismaClient.organization.create).toHaveBeenCalledTimes(1);
    expect(prismaClient.organization.create).toHaveBeenCalledWith({ data: newOrganization });
    expect(result).toStrictEqual(newOrganization);
  });

  test("ensure throw error when prismaClient.organization.create throws", async () => {
    //! Arrange
    prismaClient.organization.create.mockRejectedValue(new Error("create error"));
    //! Act
    const result = sut.create(organization);
    //! Assert
    await expect(result).rejects.toThrow("create error");
  });

  test("ensure copy only organization properties to return object", async () => {
    //! Arrange
    const newOrganization = { ...organization, id: "another-uuid" };
    prismaClient.organization.create.mockResolvedValue(
      mock<PrismaOrganization>({ ...newOrganization, updatedAt: new Date() }),
    );
    //! Act
    const result = await sut.create(organization);
    //! Assert
    expect(result).toStrictEqual(newOrganization);
  });
});

describe("organization-repository-impl.test.ts - update", () => {
  let prismaClient: DeepMockProxy<PrismaClient>;
  let uuidService: MockProxy<UuidService>;
  let sut: OrganizationRepositoryImpl;
  let organization: Organization;

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>();
    uuidService = mock<UuidService>();
    organization = {
      id: "emptId",
      name: "name",
      cnpj: "cnpj",
      phone: "phone",
      email: "email",
      address: "address",
      city: "city",
      state: "state",
      zip: "zip",
      country: "country",
      isArchived: false,
    };

    const uuid = "6a2f41a3-c54c-fce8-32d2-0324e1c32e22";
    uuidService.generateV7.mockReturnValue(uuid);
    prismaClient.organization.create.mockResolvedValue(mock<PrismaOrganization>({ ...organization, id: uuid }));

    sut = new OrganizationRepositoryImpl({ prismaClient, uuidService });
  });

  test("ensure update organization correctly", async () => {
    //! Arrange
    const updatedOrganization = { ...organization, name: "new name" };
    prismaClient.organization.update.mockResolvedValue(mock<PrismaOrganization>({ ...updatedOrganization }));
    //! Act
    const result = await sut.update(updatedOrganization);
    //! Assert
    expect(prismaClient.organization.update).toHaveBeenCalledTimes(1);
    expect(prismaClient.organization.update).toHaveBeenCalledWith({
      where: { id: updatedOrganization.id },
      data: updatedOrganization,
    });
    expect(result).toStrictEqual(updatedOrganization);
  });

  test("ensure throw error when prismaClient.organization.update throws", async () => {
    //! Arrange
    prismaClient.organization.update.mockRejectedValue(new Error("update error"));
    //! Act
    const result = sut.update(organization);
    //! Assert
    await expect(result).rejects.toThrow("update error");
  });

  test("ensure copy only organization properties to return object", async () => {
    //! Arrange
    const updatedOrganization = { ...organization, name: "new name" };
    prismaClient.organization.update.mockResolvedValue(
      mock<PrismaOrganization>({ ...updatedOrganization, updatedAt: new Date() }),
    );
    //! Act
    const result = await sut.update(updatedOrganization);
    //! Assert
    expect(result).toStrictEqual(updatedOrganization);
  });
});
