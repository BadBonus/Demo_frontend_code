type NullToUndefined<T> = T extends null
  ? undefined
  : T extends (infer U)[]
    ? NullToUndefined<U>[]
    : T extends Record<string, any>
      ? { [K in keyof T]: NullToUndefined<T[K]> }
      : T;

export function sanitizeNulls<T>(input: T): NullToUndefined<T> {
  if (input === null) {
    return undefined as NullToUndefined<T>;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeNulls) as NullToUndefined<T>;
  }

  if (typeof input === 'object' && input !== null && input.constructor === Object) {
    const entries = Object.entries(input).map(([key, value]) => [key, sanitizeNulls(value)]);
    return Object.fromEntries(entries) as NullToUndefined<T>;
  }

  return input as NullToUndefined<T>;
}
