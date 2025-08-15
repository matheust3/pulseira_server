import { Device } from "../../domain/models/device";

export interface DevicesRepository {
  findById(id: string): Promise<Device | null>;
  findAll(): Promise<Device[]>;
  create(device: Device): Promise<Device>;
  update(device: Device): Promise<Device | null>;
  delete(id: string): Promise<void>;
}
