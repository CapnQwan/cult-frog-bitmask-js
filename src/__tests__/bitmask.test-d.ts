import { describe, expectTypeOf, it } from 'vitest';

import { Bitflags, Bitmask } from '../index.js';

import type { MaskOf, RawBitmask } from '../index.js';

const Clear = Bitflags.fromNames(['color', 'depth']);
const Pass = Bitflags.fromNames(['sprite', 'shadow']);
type ClearMask = MaskOf<typeof Clear>;

describe('named masks', () => {
  it('combine with flags from their own set and keep its type', () => {
    expectTypeOf(Bitmask.add(Clear.color, Clear.depth)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.remove(Clear.color, Clear.depth)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.toggle(Clear.color, Clear.depth)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.intersect(Clear.color, Clear.depth)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.has(Clear.color, Clear.depth)).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.hasAny(Clear.color, Clear.depth)).toEqualTypeOf<boolean>();
  });

  it('accept NONE and ALL in either argument', () => {
    expectTypeOf(Bitmask.add(Bitmask.NONE, Clear.color)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.remove(Bitmask.ALL, Clear.color)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.add(Clear.color, Bitmask.ALL)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.remove(Clear.color, Bitmask.NONE)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.toggle(Bitmask.ALL, Clear.color)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.toggle(Clear.color, Bitmask.ALL)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.intersect(Bitmask.ALL, Clear.color)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.intersect(Clear.color, Bitmask.NONE)).toEqualTypeOf<ClearMask>();
    expectTypeOf(Bitmask.has(Bitmask.ALL, Clear.color)).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.hasAny(Clear.color, Bitmask.NONE)).toEqualTypeOf<boolean>();
  });

  it('never mix with masks from another set', () => {
    // @ts-expect-error a Pass flag isn't one of Clear's, so add rejects it.
    Bitmask.add(Clear.color, Pass.sprite);
    // @ts-expect-error a Pass flag isn't one of Clear's, so remove rejects it.
    Bitmask.remove(Clear.color, Pass.sprite);
    // @ts-expect-error a Pass flag isn't one of Clear's, so toggle rejects it.
    Bitmask.toggle(Clear.color, Pass.sprite);
    // @ts-expect-error a Pass flag isn't one of Clear's, so intersect rejects it.
    Bitmask.intersect(Clear.color, Pass.sprite);
    // @ts-expect-error a Pass flag isn't one of Clear's, so has rejects it.
    Bitmask.has(Clear.color, Pass.sprite);
    // @ts-expect-error a Pass flag isn't one of Clear's, so hasAny rejects it.
    Bitmask.hasAny(Clear.color, Pass.sprite);
  });

  it('are not assignable to a mask of another set', () => {
    // @ts-expect-error a Clear mask isn't a Pass mask.
    const _pass: MaskOf<typeof Pass> = Clear.color;
  });
});

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
    expectTypeOf(Bitmask.toggle(layers, Bitmask.fromBit(0))).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.intersect(layers, Bitmask.fromBit(2))).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.has(layers, Bitmask.fromBit(2))).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.hasAny(layers, Bitmask.fromBit(2))).toEqualTypeOf<boolean>();
  });

  it('accept NONE and ALL in either argument', () => {
    const layers = Bitmask.fromBit(3);
    expectTypeOf(Bitmask.add(Bitmask.NONE, layers)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.add(layers, Bitmask.ALL)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.toggle(Bitmask.NONE, layers)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.toggle(layers, Bitmask.ALL)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.intersect(Bitmask.ALL, layers)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.NONE).toExtend<RawBitmask>();
    expectTypeOf(Bitmask.ALL).toExtend<RawBitmask>();
  });

  it('never mix with named masks', () => {
    const layers = Bitmask.fromBit(3);
    // @ts-expect-error a raw mask can't take named flags in add.
    Bitmask.add(layers, Clear.color);
    // @ts-expect-error a raw mask can't take named flags in remove.
    Bitmask.remove(layers, Clear.color);
    // @ts-expect-error a raw mask can't take named flags in toggle.
    Bitmask.toggle(layers, Clear.color);
    // @ts-expect-error a raw mask can't take named flags in intersect.
    Bitmask.intersect(layers, Clear.color);
    // @ts-expect-error a raw mask can't take named flags in has.
    Bitmask.has(layers, Clear.color);
    // @ts-expect-error a raw mask can't take named flags in hasAny.
    Bitmask.hasAny(layers, Clear.color);
    // @ts-expect-error a named mask can't take raw flags.
    Bitmask.add(Clear.color, layers);
    // @ts-expect-error a named mask can't take raw flags in toggle either.
    Bitmask.toggle(Clear.color, layers);
    // @ts-expect-error a named mask can't take raw flags in intersect either.
    Bitmask.intersect(Clear.color, layers);
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

describe('setBit, clearBit and toggleBit', () => {
  it('take and return raw masks', () => {
    const layers = Bitmask.fromBit(0);
    expectTypeOf(Bitmask.setBit(layers, 5)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.clearBit(layers, 0)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.toggleBit(layers, 0)).toEqualTypeOf<RawBitmask>();
  });

  it('accept NONE and ALL', () => {
    expectTypeOf(Bitmask.setBit(Bitmask.NONE, 3)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.clearBit(Bitmask.ALL, 3)).toEqualTypeOf<RawBitmask>();
    expectTypeOf(Bitmask.toggleBit(Bitmask.NONE, 3)).toEqualTypeOf<RawBitmask>();
  });

  it('reject named masks', () => {
    let clear: ClearMask = Bitmask.NONE;
    clear = Bitmask.add(clear, Clear.color);
    // @ts-expect-error bit 9 isn't a Clear flag, so setBit can't return a Clear mask.
    Bitmask.setBit(clear, 9);
    // @ts-expect-error clearBit takes raw masks only. Use remove with a flag.
    Bitmask.clearBit(Clear.color, 0);
    // @ts-expect-error toggleBit takes raw masks only. Use toggle with a flag.
    Bitmask.toggleBit(Clear.color, 0);
  });
});

describe('hasBit, isEmpty, count and toBits', () => {
  it('accept raw and named masks, since they only read', () => {
    expectTypeOf(Bitmask.hasBit(Bitmask.fromBit(0), 0)).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.hasBit(Clear.color, 0)).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.isEmpty(Bitmask.fromBit(0))).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.isEmpty(Clear.color)).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.isEmpty(Bitmask.NONE)).toEqualTypeOf<boolean>();
    expectTypeOf(Bitmask.count(Bitmask.fromBit(0))).toEqualTypeOf<number>();
    expectTypeOf(Bitmask.count(Clear.color)).toEqualTypeOf<number>();
    expectTypeOf(Bitmask.count(Bitmask.ALL)).toEqualTypeOf<number>();
    expectTypeOf(Bitmask.toBits(Bitmask.fromBit(0))).toEqualTypeOf<number[]>();
    expectTypeOf(Bitmask.toBits(Clear.color)).toEqualTypeOf<number[]>();
    expectTypeOf(Bitmask.toBits(Bitmask.NONE)).toEqualTypeOf<number[]>();
  });
});
