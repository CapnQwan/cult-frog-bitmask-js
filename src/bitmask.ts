import { MAX_BIT, MIN_BIT } from './constants.js';

import type { Bitmask } from './_types/index.js';

export function isInRange(bit: number): boolean {
  return Number.isInteger(bit) && bit >= MIN_BIT && bit <= MAX_BIT;
}

function validateBit(bit: number): void {
  if (!isInRange(bit))
    throw new Error(`Bitmask bit out of range (${MIN_BIT}..${MAX_BIT}): got ${bit}`);
}

function fromRaw(value: number): Bitmask {
  return (value >>> 0) as Bitmask;
}

export function fromBit(bit: number): Bitmask {
  validateBit(bit);
  return fromRaw(1 << bit);
}

export function fromBits(bits: readonly number[]): Bitmask {
  let mask = NONE;
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  for (let i = 0; i < bits.length; i++) mask = set(mask, bits[i]!);
  return mask;
}

export function union(mask1: Bitmask, mask2: Bitmask): Bitmask {
  return fromRaw(mask1 | mask2);
}

export function add(mask: Bitmask, flags: Bitmask): Bitmask {
  return fromRaw(mask | flags);
}

export function remove(mask: Bitmask, flags: Bitmask): Bitmask {
  return fromRaw(mask & ~flags);
}

export function has(mask: Bitmask, flags: Bitmask): boolean {
  return (mask & flags) === flags;
}

export function hasAny(mask: Bitmask, flags: Bitmask): boolean {
  return (mask & flags) !== 0;
}

export function setBit(mask: Bitmask, bit: number): Bitmask {
  validateBit(bit);
  return fromRaw(mask | (1 << bit));
}

export function clearBit(mask: Bitmask, bit: number): Bitmask {
  validateBit(bit);
  return fromRaw(mask & ~(1 << bit));
}


export function hasBit(mask: Bitmask, bit: number): boolean {
  validateBit(bit);
  return ((mask >>> bit) & 1) === 1;
}

export const NONE = fromRaw(0x00000000);
export const ALL = fromRaw(0xffffffff);
