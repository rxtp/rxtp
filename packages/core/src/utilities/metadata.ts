import 'reflect-metadata';
import { isDefined, isFunction } from './check.js';

export const PARAM_TYPES_METADATA_KEY = 'design:paramtypes';

export const INJECTABLE_METADATA_KEY = 'rxtp:injectable';

export const INJECT_METADATA_KEY = 'rxtp:inject';

function reflectApiExists(): boolean {
  return (
    isDefined(Reflect) &&
    isDefined(Reflect.getMetadata) &&
    isFunction(Reflect.getMetadata) &&
    isDefined(Reflect.defineMetadata) &&
    isFunction(Reflect.defineMetadata)
  );
}

export function defineMetadata<T>(key: string, value: T, target: object): void {
  if (reflectApiExists()) {
    Reflect.defineMetadata(key, value, target);
  }
}

export function getMetadata<T>(key: string, target: object): T | undefined {
  if (reflectApiExists()) {
    return Reflect.getMetadata(key, target);
  }
}
