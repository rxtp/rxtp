import { isDefined, isFunction, isObject } from './check.js';
import { InjectionToken } from '../injector.js';
import {
  ClassProvider,
  ConfigurableProvider,
  FactoryProvider,
  Token,
  Provider,
  Type,
  ValueProvider,
} from '../types/injector.js';

export function isType<T>(value: unknown): value is Type<T> {
  return isDefined(value) && isFunction(value);
}

export function isToken<T>(token: Token<T>): token is InjectionToken<T> {
  return isDefined(token) && isObject(token) && token instanceof InjectionToken;
}

export function isConfigurableProvider<T>(
  provider: Provider<T>
): provider is ConfigurableProvider<T> {
  return (
    isClassProvider(provider) ||
    isFactoryProvider(provider) ||
    isValueProvider(provider)
  );
}

export function isClassProvider<T>(
  provider: Provider<T>
): provider is ClassProvider<T> {
  return (
    isObject(provider) && isDefined((provider as ClassProvider<T>)['useClass'])
  );
}

export function isFactoryProvider<T>(
  provider: Provider<T>
): provider is FactoryProvider<T> {
  return (
    isObject(provider) &&
    isDefined((provider as FactoryProvider<T>)['useFactory'])
  );
}

export function isValueProvider<T>(
  provider: Provider<T>
): provider is ValueProvider<T> {
  return (
    isObject(provider) && isDefined((provider as ValueProvider<T>)['useValue'])
  );
}
