export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isFunction(
  value: unknown
): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isObject(value: unknown): value is object {
  return typeof value === 'object';
}

export function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}
