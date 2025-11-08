interface RateLimitWindow {
  requests: number[];
  limit: number;
  windowMs: number;
}

export class RiotRateLimiter {
  private shortWindow: RateLimitWindow = {
    requests: [],
    limit: 20,
    windowMs: 1000,
  };

  private longWindow: RateLimitWindow = {
    requests: [],
    limit: 100,
    windowMs: 120000, // 2 minutes
  };

  private cleanWindow(window: RateLimitWindow): void {
    const now = Date.now();
    const cutoff = now - window.windowMs;
    window.requests = window.requests.filter((timestamp) => timestamp > cutoff);
  }

  private canMakeRequest(): boolean {
    this.cleanWindow(this.shortWindow);
    this.cleanWindow(this.longWindow);

    return (
      this.shortWindow.requests.length < this.shortWindow.limit &&
      this.longWindow.requests.length < this.longWindow.limit
    );
  }

  private calculateWaitTime(): number {
    this.cleanWindow(this.shortWindow);
    this.cleanWindow(this.longWindow);

    const shortWait =
      this.shortWindow.requests.length >= this.shortWindow.limit
        ? this.shortWindow.requests[0]! + this.shortWindow.windowMs - Date.now()
        : 0;

    const longWait =
      this.longWindow.requests.length >= this.longWindow.limit
        ? this.longWindow.requests[0]! + this.longWindow.windowMs - Date.now()
        : 0;

    return Math.max(shortWait, longWait, 0);
  }

  private recordRequest(): void {
    const now = Date.now();
    this.shortWindow.requests.push(now);
    this.longWindow.requests.push(now);
  }

  async acquireSlot(): Promise<void> {
    while (!this.canMakeRequest()) {
      const waitTime = this.calculateWaitTime();
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime + 10)); // +10ms buffer
      }
    }
    this.recordRequest();
  }

  getStatus() {
    this.cleanWindow(this.shortWindow);
    this.cleanWindow(this.longWindow);

    return {
      shortWindow: {
        used: this.shortWindow.requests.length,
        limit: this.shortWindow.limit,
        remaining: this.shortWindow.limit - this.shortWindow.requests.length,
      },
      longWindow: {
        used: this.longWindow.requests.length,
        limit: this.longWindow.limit,
        remaining: this.longWindow.limit - this.longWindow.requests.length,
      },
    };
  }

  reset(): void {
    this.shortWindow.requests = [];
    this.longWindow.requests = [];
  }
}

export const riotRateLimiter = new RiotRateLimiter();
