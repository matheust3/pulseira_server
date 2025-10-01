import { DevicesRepository } from "../../core/application/repositories/devices-repository";
import { Device } from "../../core/domain/models/device";
import { MemoryDB } from "../db/memory-db";

export class DevicesRepositoryImpl implements DevicesRepository {
  private collectionName = "devices";
  private db: MemoryDB;

  constructor(db: MemoryDB) {
    // Initialize the repository with the in-memory database
    this.db = db;
  }

  findById(id: string): Promise<Device | null> {
    return this.db.findById<Device>(this.collectionName, id);
  }

  findAll(): Promise<Device[]> {
    return this.db.findAll<Device>(this.collectionName);
  }

  create(device: Device): Promise<Device> {
    return this.db.create<Device>(this.collectionName, device);
  }

  update(device: Device): Promise<Device | null> {
    return this.db.update<Device>(this.collectionName, device.id, device);
  }

  delete(id: string): Promise<void> {
    return this.db.delete(this.collectionName, id);
  }
}
