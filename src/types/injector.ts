import { InjectionToken } from '../injector';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyType = any;

export type Type<T = AnyType> = new (...args: AnyType[]) => T;

export type Factory<T> = (...args: unknown[]) => T;

export type Token<T> = Type<T> | InjectionToken<T>;

export enum Lifecycle {
  Transient,
  Singleton,
  Message, // New: Message-scoped providers
}

export interface InjectableMetadata {
  lifecycle: Lifecycle;
}

export interface ClassProvider<T> {
  provide: Token<T>;
  useClass: Type<T>;
  lifecycle?: Lifecycle;
}

export interface FactoryProvider<T> {
  provide: Token<T>;
  useFactory: Factory<T>;
  deps?: Token<unknown>[];
  lifecycle?: Lifecycle;
}

export interface ValueProvider<T> {
  provide: Token<T>;
  useValue: T;
}

export type ConfigurableProvider<T> = ClassProvider<T> | FactoryProvider<T> | ValueProvider<T>;

export type Provider<T = AnyType> = Type<T> | ConfigurableProvider<T>;

export type Providers = Provider[];
