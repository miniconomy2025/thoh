import { Mutex } from 'async-mutex';

export class MutexWrapper<T> {
  private value: T;
  private mutex = new Mutex();

  constructor(initial: T) {
    this.value = initial;
  }

  async read<R>(fn: (val: T) => R | Promise<R>): Promise<R> {
    const release = await this.mutex.acquire();
    try {
      return await fn(this.value);
    } finally {
      release();
    }
  }

  async update(fn: (prev: T) => T | Promise<T>): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      this.value = await fn(this.value);
    } finally {
      release();
    }
  }
}
