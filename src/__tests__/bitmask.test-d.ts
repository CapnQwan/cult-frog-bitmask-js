import { describe, expectTypeOf, it } from 'vitest';

import { Bitflags, Bitmask } from '../index.js';

import type { MaskOf, RawBitmask } from '../index.js';

const Clear = Bitflags.fromNames(['color', 'depth']);
type ClearMask = MaskOf<typeof Clear>;

describe('raw masks', () => {
  it('are returned by the bit-position builders', () => {
    expectTypeOf(Bitmask.fromBit(0)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.fromBits([0, 1])).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.fromRaw(0b11)).toEqualTypeOf<RawBitmask>();
  });

  it('combine with each other and stay raw', () => {
    const layers = Bitmask.fromBits([0, 2]);
    expectTypeOf(Bitmask.add(layers, Bitmask.fromBit(4))).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.remove(layers, Bitmask.fromBit(0))).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.has(layers, Bitmask.fromBit(2))).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.hasAny(layers, Bitmask.fromBit(2))).toEqualTypeOf<boolean>();
  });

  it('accept NONE and ALL in either argument', () => {
    const layers = Bitmask.fromBit(3);
    expectTypeOf(Bitmask.add(Bitmask.NONE, layers)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.add(layers, Bitmask.ALL)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.NONE).toExtend<RawBitmask>();
    expectTypeOf(Bitmask.ALL).toExtend<RawBitmask>();
  });

  it('never mix with named masks', () => {
    const layers = Bitmask.fromBit(3);
    // @ts-expect-error a raw mask can't take named flags in add.
    Bitmask.add(layers, Clear.color);
    // @ts-expect-error a raw mask can't take named flags in remove.
    Bitmask.remove(layers, Clear.color);
    // @ts-expect-error a raw mask can't take named flags in has.
    Bitmask.has(layers, Clear.color);
    // @ts-expect-error a raw mask can't take named flags in hasAny.
    Bitmask.hasAny(layers, Clear.color);
    // @ts-expect-error a named mask can't take raw flags.
    Bitmask.add(Clear.color, layers);
    // @ts-expect-error a mask from fromRaw is raw too, so a named mask rejects it.
    Bitmask.has(Clear.color, Bitmask.fromRaw(1));
  });

  it('are not assignable to or from named masks', () => {
    // @ts-expect-error a raw mask doesn't belong to the Clear set.
    const _named: ClearMask = Bitmask.fromBit(0);
    // @ts-expect-error a Clear mask isn't a raw mask.
    const _raw: RawBitmask = Clear.color;
  });
});

describe('setBit and clearBit', () => {
  it('take and return raw masks', () => {
    const layers = Bitmask.fromBit(0);
    expectTypeOf(Bitmask.setBit(layers, 5)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.clearBit(layers, 0)).toEqualTypeOf<RawBitmask>();
  });

  it('accept NONE and ALL', () => {
    expectTypeOf(Bitmask.setBit(Bitmask.NONE, 3)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.clearBit(Bitmask.ALL, 3)).toEqualTypeOf<RawBitmask>();
  });

  it('reject named masks', () => {
    let clear: ClearMask = Bitmask.NONE;
    clear = Bitmask.add(clear, Clear.color);
    // @ts-expect-error bit 9 isn't a Clear flag, so setBit can't return a Clear mask.
    Bitmask.setBit(clear, 9);
    // @ts-expect-error clearBit takes raw masks only. Use remove with a flag.
    Bitmask.clearBit(Clear.color, 0);
  });
});

describe('hasBit', () => {
  it('accepts raw and named masks, since it only reads', () => {
    expectTypeOf(Bitmask.hasBit(Bitmask.fromBit(0), 0)).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.hasBit(Clear.color, 0)).toEqualTypeOf<boolean>();
  });
});
