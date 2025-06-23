import { DeepMockProxy, mock, mockDeep } from "jest-mock-extended";
import { LocationServiceImpl } from "./location-service-impl";
import { PrismaClient, State as PrismaState } from "@prisma/client";
import { State } from "../../core/domain/models/location/state";

describe("location-service.test-impl.ts - getStates", () => {
  let prismaClient: DeepMockProxy<PrismaClient>;
  let mockStates: State[];
  let sut: LocationServiceImpl;

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>();
    sut = new LocationServiceImpl({ prismaClient });

    mockStates = [
      { id: "1", name: "State1", abbreviation: "ST1" },
      { id: "2", name: "State2", abbreviation: "ST2" },
    ];
  });

  test("", async () => {
    //! Arrange
    //! Act
    //! Assert
  });

  test("should return a list of states", async () => {
    //! Arrange
    prismaClient.state.findMany.mockResolvedValue(mock<PrismaState[]>(mockStates));
    //! Act
    const result = await sut.getStates();

    //! Assert
    expect(result).toEqual(
      mockStates.map((state) => ({ id: state.id, name: state.name, abbreviation: state.abbreviation })),
    );
  });

  test("should throw an error if prisma throws", async () => {
    //! Arrange
    const errorMessage = "Prisma error";
    const error = new Error(errorMessage);
    prismaClient.state.findMany.mockRejectedValue(error);

    //! Act & Assert
    await expect(sut.getStates()).rejects.toThrow(error);
  });
});
