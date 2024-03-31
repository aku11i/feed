export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (typeof value === "undefined" || value === null) {
    throw new Error(`Expected value to be defined, but received ${value}`);
  }
}

export function ensureIsDefined<T>(value: T): NonNullable<T> {
  assertIsDefined(value);
  return value;
}
