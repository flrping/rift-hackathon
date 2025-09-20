type Entry<T> = {
  data: T;
  created: number;
};

export class SimpleCache<T> {
  private cache = new Map<string, Entry<T>>();
  private ttl: number;

  constructor(ttlMs: number = 1000 * 60 * 60) {
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.created > this.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async getOrLoad(key: string, loader: () => Promise<T>): Promise<T> {
    const existing = this.get(key);
    if (existing !== null) return existing;

    const value = await loader();
    this.set(key, value);
    return value;
  }

  set(key: string, value: T) {
    this.cache.set(key, {
      data: value,
      created: Date.now(),
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}
