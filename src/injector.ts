export type Token<T> = string | symbol | (new (...args: unknown[]) => T);
export type Factory<T> = (injector: Injector) => T;

export class Injector {
  private providers = new Map<Token<unknown>, Factory<unknown>>();
  private instances = new Map<Token<unknown>, unknown>();

  constructor(private parent?: Injector) {}

  register<T>(token: Token<T>, factory: Factory<T>): void {
    this.providers.set(token, factory);
  }

  get<T>(token: Token<T>): T {
    if (this.instances.has(token)) {
      return this.instances.get(token) as T;
    }

    const factory = this.providers.get(token);
    if (factory) {
      const instance = factory(this) as T;
      this.instances.set(token, instance);
      return instance;
    }

    if (this.parent) {
      return this.parent.get(token);
    }

    throw new Error(`No provider for ${typeof token === 'function' ? token.name : String(token)}`);
  }

  child(): Injector {
    return new Injector(this);
  }
}
