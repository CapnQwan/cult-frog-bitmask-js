import * as Bitmask from './bitmask.js';
import { BIT_COUNT } from './constants.js';

import type { BitFlags, BitLayout } from './_types/bitflags.js';

function validateLength(length: number): void {
  if (length > BIT_COUNT)
    throw new RangeError(`BitFlags: too many names, epected ${BIT_COUNT} or less, got ${length}`);
}

function validateUnique(names: readonly string[]): void {
  if (names.length !== new Set(names).size)
    throw new RangeError(
      `BitFlags: duplicate names, expected ${names.length} unique names, got ${new Set(names).size}`
    );
}

export function create<const T extends BitLayout>(layout: T): BitFlags<Extract<keyof T, string>> {
  const bitmaskFields: Record<string, number> = {};
  const entries = Object.entries(layout);
  validateLength(entries.length);
  for (const [key, value] of entries) bitmaskFields[key] = Bitmask.fromBit(value);
  return bitmaskFields as BitFlags<Extract<keyof T, string>>;
}

export function fromNames<const T extends readonly string[]>(names: T): BitFlags<T[number]> {
  validateLength(names.length);
  validateUnique(names);
  return create(Object.fromEntries(names.map((name, bit) => [name, bit])));
}
