import { MAX_BIT, MIN_BIT } from './constants.js';

import type { RawBitmask } from './_types/bitmask.js';
import type { Bitmask } from './_types/index.js';

/**
 * Whether `bit` is a position a mask can hold: an integer from 0 to 31.
 *
 * Every function that takes a bit position throws for one outside this range, so use this to
 * filter values that may legitimately fall outside it, such as layer numbers from game data.
 *
 * @example
 * ```ts
 * Bitmask.isInRange(31); // true
 * Bitmask.isInRange(32); // false
 * ```
 *
 * @param bit - The bit position to check.
 * @returns `true` if `bit` is an integer from 0 to 31.
 */
export function isInRange(bit: number): boolean {
  return Number.isInteger(bit) && bit >= MIN_BIT && bit <= MAX_BIT;
}

function validateBit(bit: number): void {
  if (!isInRange(bit))
    throw new RangeError(`Bitmask bit out of range (${MIN_BIT}..${MAX_BIT}): got ${bit}`);
}

function toMask<F extends string = string>(value: number): Bitmask<F> {
  return (value >>> 0) as Bitmask<F>;
}

export function fromRaw(value: number): RawBitmask {
  return toMask(value) as RawBitmask;
}

/**
 * Creates a mask with a single bit set.
 *
 * Bit 31 comes back as a positive number, `2 ** 31`, unlike `1 << 31`.
 *
 * @example
 * ```ts
 * Bitmask.fromBit(2); // 0b100
 * ```
 *
 * @param bit - The bit position, from 0 to 31.
 * @returns A raw mask with only `bit` set.
 * @throws {RangeError} If `bit` isn't an integer from 0 to 31.
 */
export function fromBit(bit: number): RawBitmask {
  validateBit(bit);
  return fromRaw(1 << bit);
}

/**
 * Creates a mask with every given bit set. No bits gives `NONE`, and repeated bits are ignored.
 *
 * @example
 * ```ts
 * Bitmask.fromBits([0, 2]); // 0b101
 * ```
 *
 * @param bits - The bit positions, each from 0 to 31.
 * @returns A raw mask with every bit in `bits` set.
 * @throws {RangeError} If any bit isn't an integer from 0 to 31.
 */
export function fromBits(bits: readonly number[]): RawBitmask {
  let mask: RawBitmask = NONE;
  for (const bit of bits) mask = setBit(mask, bit);
  return mask;
}

/**
 * Returns `mask` with every bit in `flags` set as well.
 *
 * This overload is for `NONE` or `ALL` as `mask`: the result takes its flag names from `flags`.
 *
 * @example
 * ```ts
 * const mask = Bitmask.add(Bitmask.NONE, Ability.jump);
 * ```
 *
 * @param mask - `NONE` or `ALL`.
 * @param flags - The flags to set.
 * @returns A new mask with the bits of both.
 */
export function add<F extends string>(mask: Bitmask<never>, flags: Bitmask<F>): Bitmask<F>;
/**
 * Returns `mask` with every bit in `flags` set as well.
 *
 * `flags` must come from the same flag set as `mask`, so mixing sets is a compile error.
 *
 * @example
 * ```ts
 * abilities = Bitmask.add(abilities, Ability.swim);
 * ```
 *
 * @param mask - The mask to add to.
 * @param flags - The flags to set.
 * @returns A new mask with the bits of both.
 */
export function add<F extends string = string>(
  mask: Bitmask<F>,
  flags: Bitmask<NoInfer<F>>
): Bitmask<F>;
export function add(mask: Bitmask, flags: Bitmask): Bitmask {
  return fromRaw(mask | flags);
}

/**
 * Returns `mask` with every bit in `flags` cleared.
 *
 * This overload is for `NONE` or `ALL` as `mask`: the result takes its flag names from `flags`.
 * `ALL` sets all 32 bits, so `remove(ALL, flag)` still has every bit outside the flag set.
 *
 * @example
 * ```ts
 * const allButDepth = Bitmask.remove(Bitmask.ALL, Clear.depth);
 * ```
 *
 * @param mask - `NONE` or `ALL`.
 * @param flags - The flags to clear.
 * @returns A new mask without the bits of `flags`.
 */
export function remove<F extends string>(mask: Bitmask<never>, flags: Bitmask<F>): Bitmask<F>;
/**
 * Returns `mask` with every bit in `flags` cleared. Bits in `flags` that `mask` lacks are ignored.
 *
 * `flags` must come from the same flag set as `mask`, so mixing sets is a compile error.
 *
 * @example
 * ```ts
 * abilities = Bitmask.remove(abilities, Ability.jump);
 * ```
 *
 * @param mask - The mask to remove from.
 * @param flags - The flags to clear.
 * @returns A new mask without the bits of `flags`.
 */
export function remove<F extends string = string>(
  mask: Bitmask<F>,
  flags: Bitmask<NoInfer<F>>
): Bitmask<F>;
export function remove(mask: Bitmask, flags: Bitmask): Bitmask {
  return fromRaw(mask & ~flags);
}

/**
 * Whether `mask` has every bit in `flags` set.
 *
 * This overload is for `NONE` or `ALL` as `mask`, which accept flags from any set.
 *
 * @example
 * ```ts
 * Bitmask.has(Bitmask.ALL, Clear.color); // true
 * ```
 *
 * @param mask - `NONE` or `ALL`.
 * @param flags - The flags to look for.
 * @returns `true` if every bit in `flags` is set in `mask`.
 */
export function has<F extends string>(mask: Bitmask<never>, flags: Bitmask<F>): boolean;
/**
 * Whether `mask` has every bit in `flags` set.
 *
 * - `flags` must come from the same flag set as `mask`, so mixing sets is a compile error.
 * - `has(mask, NONE)` is always `true`, as every mask contains no flags. Use `hasAny` to ask
 *   whether at least one flag is set.
 *
 * @example
 * ```ts
 * Bitmask.has(abilities, Ability.swim);
 * ```
 *
 * @param mask - The mask to check.
 * @param flags - The flags to look for.
 * @returns `true` if every bit in `flags` is set in `mask`.
 */
export function has<F extends string = string>(
  mask: Bitmask<F>,
  flags: Bitmask<NoInfer<F>>
): boolean;
export function has(mask: Bitmask, flags: Bitmask): boolean {
  return fromRaw(mask & flags) === flags;
}

/**
 * Whether `mask` has at least one bit in `flags` set.
 *
 * This overload is for `NONE` or `ALL` as `mask`, which accept flags from any set.
 *
 * @example
 * ```ts
 * Bitmask.hasAny(Bitmask.ALL, Clear.color); // true
 * ```
 *
 * @param mask - `NONE` or `ALL`.
 * @param flags - The flags to look for.
 * @returns `true` if `mask` and `flags` share any bit.
 */
export function hasAny<F extends string>(mask: Bitmask<never>, flags: Bitmask<F>): boolean;
/**
 * Whether `mask` has at least one bit in `flags` set.
 *
 * - `flags` must come from the same flag set as `mask`, so mixing sets is a compile error.
 * - `hasAny(mask, NONE)` is always `false`, as there's no flag to share.
 *
 * @example
 * ```ts
 * Bitmask.hasAny(abilities, Bitmask.add(Ability.swim, Ability.fly));
 * ```
 *
 * @param mask - The mask to check.
 * @param flags - The flags to look for.
 * @returns `true` if `mask` and `flags` share any bit.
 */
export function hasAny<F extends string = string>(
  mask: Bitmask<F>,
  flags: Bitmask<NoInfer<F>>
): boolean;
export function hasAny(mask: Bitmask, flags: Bitmask): boolean {
  return fromRaw(mask & flags) !== 0;
}

/**
 * Returns `mask` with the bit at position `bit` set.
 *
 * Takes only raw masks, from `fromBit`, `fromBits`, `fromRaw`, `NONE` or `ALL`. A named mask is
 * a compile error, because the bit might not be one of its set's flags. Use `add` with a flag
 * instead.
 *
 * @example
 * ```ts
 * layers = Bitmask.setBit(layers, 3);
 * ```
 *
 * @param mask - The mask to add to.
 * @param bit - The bit position, from 0 to 31.
 * @returns A new mask with `bit` set.
 * @throws {RangeError} If `bit` isn't an integer from 0 to 31.
 */
export function setBit(mask: RawBitmask, bit: number): RawBitmask {
  validateBit(bit);
  return fromRaw(mask | (1 << bit));
}

/**
 * Returns `mask` with the bit at position `bit` cleared.
 *
 * Takes only raw masks, from `fromBit`, `fromBits`, `fromRaw`, `NONE` or `ALL`. A named mask is
 * a compile error, since in a set from `fromNames` a bit position can point at a different flag
 * after a name is inserted. Use `remove` with a flag instead.
 *
 * @example
 * ```ts
 * layers = Bitmask.clearBit(layers, 3);
 * ```
 *
 * @param mask - The mask to remove from.
 * @param bit - The bit position, from 0 to 31.
 * @returns A new mask with `bit` cleared.
 * @throws {RangeError} If `bit` isn't an integer from 0 to 31.
 */
export function clearBit(mask: RawBitmask, bit: number): RawBitmask {
  validateBit(bit);
  return fromRaw(mask & ~(1 << bit));
}

/**
 * Whether the bit at position `bit` is set in `mask`.
 *
 * Unlike `setBit` and `clearBit`, it accepts any mask, raw or named, as it only reads. That makes
 * it handy for debugging a named mask, but prefer `has` with a flag in real code.
 *
 * @example
 * ```ts
 * if (Bitmask.hasBit(camera.layers, sprite.layer)) draw(sprite);
 * ```
 *
 * @param mask - The mask to check.
 * @param bit - The bit position, from 0 to 31.
 * @returns `true` if `bit` is set in `mask`.
 * @throws {RangeError} If `bit` isn't an integer from 0 to 31.
 */
export function hasBit(mask: Bitmask, bit: number): boolean {
  validateBit(bit);
  return ((mask >>> bit) & 1) === 1;
}

/** The mask with no bits set. It fits the mask type of every flag set, and raw masks too. */
export const NONE = toMask<never>(0x00000000);

/**
 * The mask with all 32 bits set, as the positive number `0xffffffff`. It fits the mask type of
 * every flag set, and raw masks too, but sets every bit rather than only that set's flags.
 */
export const ALL = toMask<never>(0xffffffff);
