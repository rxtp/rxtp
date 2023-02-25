import { InjectionToken } from '../injector.js';

/**
 * A `Type` is a constructor function.
 *
 * @public
 */
export interface Type<T> extends Function {
  new (...args: unknown[]): T;
}

/**
 * A `Factory` is a function that returns an instance of a type.
 *
 * @public
 */
export type Factory<T> = (...args: unknown[]) => T;

/**
 * A `Token` is a unique identifier. It can be a `Type` or an
 * `InjectionToken`.
 *
 * @public
 */
export type Token<T> = Type<T> | InjectionToken<T>;

/**
 * The `Lifecycle` of a provider defines how long the provider will live
 * in the injector. The default is `Transient`, which means that a new
 * instance of the provider will be created each time it is injected.
 *
 * @public
 */
export enum Lifecycle {
  /*
   * A `Transient` provider will be created each time it is injected.
   */
  Transient,

  /*
   * A `Singleton` provider will be created once when the injector is
   * created and will be reused each time it is injected.
   */
  Singleton,
}

/**
 * Defines the configuration of an `Injectable`.
 *
 * @public
 */
export interface InjectableMetadata {
  /**
   * The `Lifecycle` of the provider.
   */
  lifecycle: Lifecycle;
}

/**
 * A `ClassProvider` is a provider that returns an instance of a type.
 * The type is instantiated using the `new` keyword.
 *
 * @public
 */
export interface ClassProvider<T> {
  /**
   * The `Token` that the provider will be registered with.
   */
  provide: Token<T>;

  /**
   * The `Type` that will be instantiated.
   */
  useClass: Type<T>;

  /**
   * The `Lifecycle` of the provider.
   */
  lifecycle?: Lifecycle;
}

/**
 * A `FactoryProvider` is a provider that returns an instance of a type.
 * The type is instantiated using a factory function.
 *
 * @public
 */
export interface FactoryProvider<T> {
  /**
   * The `Token` that the provider will be registered with.
   */
  provide: Token<T>;

  /**
   * The `Factory` that will be used to instantiate the type.
   */
  useFactory: Factory<T>;

  /**
   * The `Token`s that will be injected into the factory function.
   */
  deps?: Token<unknown>[];

  /**
   * The `Lifecycle` of the provider.
   */
  lifecycle?: Lifecycle;
}

/**
 * A `ValueProvider` is a provider that returns an instance of a type.
 * The type is instantiated using a value.
 *
 * @public
 */
export interface ValueProvider<T> {
  /**
   * The `Token` that the provider will be registered with.
   */
  provide: Token<T>;

  /**
   * The value that will be returned.
   */
  useValue: T;
}

/**
 * A `Provider` that can be configured. This is used to register providers
 * with the injector. The injector will use the `useClass`, `useFactory`,
 * or `useValue` properties to instantiate the provider.
 *
 * @public
 */
export type ConfigurableProvider<T> =
  | ClassProvider<T>
  | FactoryProvider<T>
  | ValueProvider<T>;

/**
 * A `Provider` is a `Type` or a `ConfigurableProvider`. A `Type` will be registered
 * with the `Injector` using the `ClassProvider` configuration.
 *
 * @public
 */
export type Provider<T> = Type<T> | ConfigurableProvider<T>;

/**
 * An array of `Provider`s.
 *
 * @public
 */
export type Providers = Provider<unknown>[];
