/**
 * The lowest bit position a mask has: bit 0, the least significant bit.
 *
 * Public as `Bitmask.MIN_BIT`.
 */
export const MIN_BIT = 0;

/**
 * The highest bit position a mask has: bit 31.
 *
 * Bit 31 is the sign bit for JavaScript's bitwise operators, so `1 << 31` is negative. Every
 * function in this package returns it as the positive number `2 ** 31` instead.
 *
 * Public as `Bitmask.MAX_BIT`.
 */
export const MAX_BIT = 31;

/**
 * How many bits a mask has, and so the most flags one flag set can hold.
 *
 * JavaScript's bitwise operators work on 32-bit integers, so a mask in a single number can't
 * hold more: `1 << 32` wraps around to `1` rather than reaching a 33rd bit.
 *
 * Public as `Bitmask.BIT_COUNT`.
 */
export const BIT_COUNT = 32;

/**
 * The smallest value `Bitmask.fromRaw` accepts: bit 31 alone, read as a signed 32-bit integer.
 *
 * Negative values are allowed so that masks from an `Int32Array`, or built by hand with `|`, `~`
 * or `<<`, work with bit 31 set. Internal, not exported from the package.
 */
export const MIN_RAW = -(2 ** 31);

/**
 * The largest value `Bitmask.fromRaw` accepts: every bit set, read as an unsigned 32-bit integer.
 *
 * Internal, not exported from the package.
 */
export const MAX_RAW = 2 ** 32 - 1;

/**
 * The value of `Bitmask.NONE`: no bits set.
 *
 * Internal, not exported from the package. Use `Bitmask.NONE`.
 */
export const RAW_NONE = 0x00000000;

/**
 * The value of `Bitmask.ALL`: every bit set, as an unsigned number.
 *
 * The same number as `MAX_RAW`, but kept separate because it means a mask rather than a limit
 * on input. Internal, not exported from the package. Use `Bitmask.ALL`.
 */
export const RAW_ALL = 0xffffffff;
