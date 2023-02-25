import { InjectionToken } from '../injector';

export enum Lifecycle {
  Transient,
  Singleton,
}

export interface Type<T> extends Function {
  new (...args: unknown[]): T;
}

export type Factory<T> = (...args: unknown[]) => T;

export type Token<T> = Type<T> | InjectionToken<T>;

interface TokenProvider<T> {
  provide: Token<T>;
}

export interface LifecycleProvider<T> extends TokenProvider<T> {
  lifecycle?: Lifecycle;
}

export interface ClassProvider<T> extends LifecycleProvider<T> {
  useClass: Type<T>;
}

export interface FactoryProvider<T> extends LifecycleProvider<T> {
  useFactory: Factory<T>;
  deps?: Token<unknown>[];
}

export interface ValueProvider<T> extends TokenProvider<T> {
  useValue: T;
}

export type ConfigurableProvider<T> =
  | ClassProvider<T>
  | FactoryProvider<T>
  | ValueProvider<T>;

export type Provider<T> = Type<T> | ConfigurableProvider<T>;

export type Providers = Provider<unknown>[];
