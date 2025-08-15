export class MemoryDB {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private data: Map<string, any> = new Map();

  async create<T>(collection: string, item: T): Promise<T> {
    const id = this.generateId();
    this.data.set(id, { ...item, id, collection });
    return { ...item, id };
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    const item = this.data.get(id);
    return item && item.collection === collection ? (item as T) : null;
  }

  async findAll<T>(collection: string): Promise<T[]> {
    return Array.from(this.data.values()).filter((item) => item.collection === collection) as T[];
  }

  async update<T>(collection: string, id: string, item: T): Promise<T | null> {
    if (!this.data.has(id)) return null;
    this.data.set(id, { ...item, id });
    return { ...item, id };
  }

  async delete(collection: string, id: string): Promise<void> {
    this.data.delete(id);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
