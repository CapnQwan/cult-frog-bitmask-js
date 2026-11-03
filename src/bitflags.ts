import * as Bitmask from './bitmask.js';
import { BIT_COUNT } from './constants.js';

import type { Bitflags, BitLayout } from './_types/bitflags.js';
import type { Bitmask as BitmaskType } from './_types/index.js';

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

/**
 * Combines every flag in `set` into one mask.
 *
 * Unlike `Bitmask.ALL`, which sets all 32 bits, the result has only the set's own bits, so
 * removing a flag from it leaves exactly the other flags. A set from `create` keeps its gaps.
 *
 * @example
 * ```ts
 * const Clear = Bitflags.fromNames(['color', 'depth', 'stencil']);
 *
 * Bitflags.all(Clear); // 0b111
 * Bitmask.remove(Bitflags.all(Clear), Clear.depth); // color and stencil only
 * ```
 *
 * @param set - The flag set to combine.
 * @returns A mask with every flag in `set` set. An empty set gives `NONE`.
 */
export function all<F extends string>(set: Bitflags<F>): BitmaskType<F> {
  let mask: BitmaskType<F> = Bitmask.NONE;
  for (const flag of Object.values<BitmaskType<F>>(set)) mask = Bitmask.add(mask, flag);
  return mask;
}

/**
 * Reads a stored number, such as from a save file or a `Uint32Array`, back as a mask of `set`.
 *
 * Masks are plain numbers, so storing one needs no conversion, but reading one back gives a
 * `number`. This checks that the value only uses the set's bits, then returns it typed as the
 * set's mask. A stray bit usually means corrupt data, or a set whose bits have moved since the
 * value was saved, such as after a name was inserted into a `fromNames` list.
 *
 * @example
 * ```ts
 * save.abilities = abilities; // storing is just the number
 * abilities = Bitflags.fromRaw(Ability, save.abilities);
 * ```
 *
 * @param set - The flag set the value was saved from.
 * @param value - The stored mask, as a signed or unsigned 32-bit integer.
 * @returns The value as a mask of `set`, always unsigned.
 * @throws {RangeError} If `value` isn't a 32-bit integer, or has a bit that isn't one of the
 * set's flags.
 */
export function fromRaw<F extends string>(set: Bitflags<F>, value: number): BitmaskType<F> {
  const mask = Bitmask.fromRaw(value);
  const stray = (mask & ~all(set)) >>> 0;
  if (stray !== 0)
    throw new RangeError(`Bitflags: bits outside the set, got 0x${stray.toString(16)} in ${value}`);
  // Safe: the check above proved every bit in `mask` is one of the set's flags.
  return mask as number as BitmaskType<F>;
}
