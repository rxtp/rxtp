import {
  ClassProvider,
  ConfigurableProvider,
  FactoryProvider,
  Lifecycle,
  Token,
  Providers,
  ValueProvider,
} from './types/injector.js';
import {
  isClassProvider,
  isConfigurableProvider,
  isFactoryProvider,
  isToken,
  isValueProvider,
} from './utilities/injector.js';
import { isDefined } from './utilities/check.js';

import {
  defineMetadata,
  getMetadata,
  INJECT_METADATA_KEY,
  INJECTABLE_METADATA_KEY,
  PARAM_TYPES_METADATA_KEY,
} from './utilities/metadata.js';

import { from, Observable } from 'rxjs';

export function Inject<T>(token: Token<T>): ParameterDecorator {
  return function (target, _, index) {
    defineMetadata<void>(INJECT_METADATA_KEY, void 0, target);
    const tokens =
      getMetadata<Token<unknown>[]>(PARAM_TYPES_METADATA_KEY, target) ?? [];
    tokens[index] = token;
    defineMetadata<Token<unknown>[]>(PARAM_TYPES_METADATA_KEY, tokens, target);
  };
}

export function Injectable(): ClassDecorator {
  return function (target) {
    defineMetadata<void>(INJECTABLE_METADATA_KEY, void 0, target);
    const tokens = getMetadata<Token<unknown>[]>(
      PARAM_TYPES_METADATA_KEY,
      target
    );
    if (!isDefined(tokens)) {
      defineMetadata<Token<unknown>[]>(PARAM_TYPES_METADATA_KEY, [], target);
    }
  };
}

export class Injector {
  private readonly _providers = new Map<
    Token<unknown>,
    ConfigurableProvider<unknown>
  >();
  private readonly _instances = new Map<Token<unknown>, unknown>();

  constructor(
    readonly providers: Providers,
    private readonly _parent: Injector | null = null
  ) {
    for (const provider of providers) {
      if (isConfigurableProvider(provider)) {
        this._providers.set(provider.provide, provider);
      } else {
        this._providers.set(provider, {
          provide: provider,
          useClass: provider,
        });
      }
    }
  }

  private async _resolveClassProvider<T>(
    provider: ClassProvider<T>,
    injector: Injector
  ): Promise<T> {
    if (
      isDefined(provider.lifecycle) &&
      provider.lifecycle === Lifecycle.Singleton
    ) {
      const instance = this._instances.get(provider.provide);
      if (isDefined(instance)) {
        return instance as T;
      }
    }
    const tokens = getMetadata<Token<unknown>[]>(
      PARAM_TYPES_METADATA_KEY,
      provider.useClass
    );
    if (isDefined(tokens)) {
      const dependencies = [];
      for (const token of tokens ?? []) {
        if (token.name === 'Object') {
          throw new Error(
            'Cannot resolve dependencies of a class with a parameter of type Object'
          );
        }
        if (token === provider.provide) {
          throw new Error(
            'Cannot resolve dependencies of a class with a parameter of type itself'
          );
        }
        dependencies.push(await injector._resolve(token, injector));
      }
      const instance = new provider.useClass(...dependencies);
      if (
        isDefined(provider.lifecycle) &&
        provider.lifecycle === Lifecycle.Singleton
      ) {
        this._instances.set(provider.provide, instance);
      }
      if (
        isDefined(provider.lifecycle) &&
        provider.lifecycle === Lifecycle.Singleton
      ) {
        this._instances.set(provider.provide, instance);
      }
      return instance;
    }
    throw new Error(
      `Ensure that class ${provider.provide.name} is decorated with @Injectable()`
    );
  }

  private async _resolveFactoryProvider<T>(
    provider: FactoryProvider<T>,
    injector: Injector
  ): Promise<T> {
    const tokens: Token<unknown>[] = provider.deps ?? [];
    if (
      isDefined(provider.lifecycle) &&
      provider.lifecycle === Lifecycle.Singleton
    ) {
      const instance = this._instances[provider.provide.name];
      if (isDefined(instance)) {
        return instance as T;
      }
    }
    const dependencies = [];
    for (const token of tokens ?? []) {
      if (token === provider.provide) {
        throw new Error(
          'Cannot resolve dependencies of a class with a parameter of type itself'
        );
      }
      dependencies.push(await injector._resolve(token, injector));
    }
    const instance = await provider.useFactory(...dependencies);
    if (
      isDefined(provider.lifecycle) &&
      provider.lifecycle === Lifecycle.Singleton
    ) {
      this._instances[provider.provide.name] = instance;
    }
    return instance;
  }

  private _resolveValueProvider<T>(provider: ValueProvider<T>): T {
    return provider.useValue;
  }

  private async _resolveToken<T>(
    token: InjectionToken<T>,
    injector: Injector
  ): Promise<T> {
    if (isDefined(token.provider)) {
      const provider: FactoryProvider<T> = {
        provide: token,
        ...(token.provider as Omit<FactoryProvider<T>, 'provide'>),
      };
      if (
        isDefined(provider.lifecycle) &&
        provider.lifecycle === Lifecycle.Singleton
      ) {
        const instance = this._instances[token.name];
        if (isDefined(instance)) {
          return instance;
        }
      }
      const tokens: Token<unknown>[] = provider.deps ?? [];
      const dependencies = [];
      for (const token of tokens ?? []) {
        if (token === provider.provide) {
          throw new Error(
            'Cannot resolve dependencies of a class with a parameter of type itself'
          );
        }
        dependencies.push(await injector._resolve(token, injector));
      }
      const instance = await provider.useFactory(...dependencies);
      if (
        isDefined(provider.lifecycle) &&
        provider.lifecycle === Lifecycle.Singleton
      ) {
        this._instances.set(provider.provide, instance);
      }
      return instance;
    }
    if (isDefined(this._parent)) {
      return await this._parent._resolve(token, injector);
    }
  }

  private async _resolve<T>(token: Token<T>, injector: Injector): Promise<T> {
    const provider = this._providers.get(token) as ConfigurableProvider<T>;
    if (isDefined(provider)) {
      if (isClassProvider(provider)) {
        return await this._resolveClassProvider(provider, injector);
      }
      if (isFactoryProvider(provider)) {
        return await this._resolveFactoryProvider(provider, injector);
      }
      if (isValueProvider(provider)) {
        return this._resolveValueProvider(provider);
      }
    }
    if (isToken(token)) {
      return await this._resolveToken(token, injector);
    }
    if (isDefined(this._parent)) {
      return await this._parent._resolve(token, injector);
    }
    throw new Error(`No provider found for token ${token.name}`);
  }

  public resolve$<T>(
    provider: Token<T>,
    injector: Injector = this
  ): Observable<T> {
    return from(this._resolve<T>(provider, injector));
  }
}

/**
 * Creates a token that can be used in a dependency injection provider. Use a `Token` whenever
 * you the type you are injecting does not have a runtime representation, such as injecting
 * an interface, callable type, array or parameterized type. `Token` is parameterized on `T`
 * which is the type of object which will be returned by the `Injector`. An optional factory
 * configuration can be provided to the `Token` which will be used to create the object.
 *
 * @public
 */
export class InjectionToken<T> {
  constructor(
    public readonly name: string,
    public readonly provider?: Omit<FactoryProvider<T>, 'provide'>
  ) {}
}
