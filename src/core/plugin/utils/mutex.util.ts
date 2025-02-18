/**
 * 简单的互斥锁实现
 */
export class Mutex {
  private locked = false;
  private waitQueue: Array<() => void> = [];

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    return new Promise<void>(resolve => {
      this.waitQueue.push(() => {
        this.locked = true;
        resolve();
      });
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const nextTask = this.waitQueue.shift();
      nextTask();
    } else {
      this.locked = false;
    }
  }

  isLocked(): boolean {
    return this.locked;
  }
  getQueueLength(): number {
    return this.waitQueue.length;
  }
}
