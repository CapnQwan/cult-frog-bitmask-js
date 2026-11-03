import * as Bitmask from './bitmask.js';
import { BIT_COUNT } from './constants.js';

import type { Bitflags, BitLayout } from './_types/bitflags.js';

function validateLength(length: number): void {
  if (length > BIT_COUNT)
    throw new RangeError(`Bitflags: too many names, expected ${BIT_COUNT} or less, got ${length}`);
}

function validateUniqueNames(names: readonly string[]): void {
  if (names.length !== new Set(names).size)
    throw new RangeError(
      `Bitflags: duplicate names, expected ${names.length} unique names, got ${new Set(names).size}`
    );
}

function validateUniqueBits(bits: readonly number[]): void {
  if (bits.length !== new Set(bits).size)
    throw new RangeError(
      `Bitflags: duplicate bits, expected ${bits.length} unique bits, got ${new Set(bits).size}`
    );
}

/**
 * Creates a flag set from a layout that maps each flag name to its bit position.
 *
 * Use it when the bits must stay fixed, such as when masks are saved or sent over the network,
 * since adding a flag never moves the others.
 *
 * - Every mask in the set shares one type, `MaskOf<typeof set>`, so a parameter of that type
 *   rejects masks from other sets.
 * - Flag names are inferred as literal types without `as const`.
 *
 * @example
 * ```ts
 * const Layer = Bitflags.create({ player: 0, enemy: 1, terrain: 4 });
 *
 * Layer.terrain; // 0b10000
 * ```
 *
 * @param layout - Flag names mapped to bit positions from 0 to 31, each position used once.
 * @returns An object with one single-bit mask per flag name.
 * @throws {RangeError} If the layout has more than 32 entries, two names share a bit position,
 * or a bit position isn't an integer from 0 to 31.
 */
export function create<const T extends BitLayout>(layout: T): Bitflags<Extract<keyof T, string>> {
  const bitmaskFields: Record<string, number> = {};
  const entries = Object.entries(layout);
  validateLength(entries.length);
  validateUniqueBits(Object.values(layout));
  for (const [key, value] of entries) bitmaskFields[key] = Bitmask.fromBit(value);
  return bitmaskFields as Bitflags<Extract<keyof T, string>>;
}

/**
 * Creates a flag set from a list of names, giving each name the next bit, starting at bit 0.
 *
 * - Bits follow the order of `names`, so inserting a name anywhere but the end moves the bits
 *   of every name after it. Use `create` when the bits must stay fixed.
 * - Every mask in the set shares one type, `MaskOf<typeof set>`, so a parameter of that type
 *   rejects masks from other sets.
 * - Flag names are inferred as literal types without `as const`.
 *
 * @example
 * ```ts
 * const Ability = Bitflags.fromNames(['jump', 'swim', 'fly']);
 *
 * Ability.jump; // 0b001
 * Ability.fly; // 0b100
 * ```
 *
 * @param names - The flag names, at most 32 and all unique.
 * @returns An object with one single-bit mask per name.
 * @throws {RangeError} If there are more than 32 names, or a name is repeated.
 */
export function fromNames<const T extends readonly string[]>(names: T): Bitflags<T[number]> {
  validateLength(names.length);
  validateUniqueNames(names);
  return create(Object.fromEntries(names.map((name, bit) => [name, bit])));
}
