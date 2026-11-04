import { describe, expectTypeOf, it } from 'vitest';

import { Bitflags, Bitmask } from '../index.js';

import type { MaskOf } from '../index.js';

const Clear = Bitflags.fromNames(['color', 'depth']);
const Layer = Bitflags.create({ player: 0, terrain: 4 });
const Pass = Bitflags.fromNames(['sprite']);

describe('all', () => {
  it("returns the set's mask type", () => {
    expectTypeOf(Bitflags.all(Clear)).toEqualTypeOf<MaskOf<typeof Clear>>();
    expectTypeOf(Bitflags.all(Layer)).toEqualTypeOf<MaskOf<typeof Layer>>();
  });

  it("combines with the set's own flags only", () => {
    expectTypeOf(Bitmask.remove(Bitflags.all(Clear), Clear.depth)).toEqualTypeOf<
      MaskOf<typeof Clear>
    >();
    // @ts-expect-error a Pass flag isn't one of Clear's.
    Bitmask.remove(Bitflags.all(Clear), Pass.sprite);
  });

  it('takes a flag set, not a mask', () => {
    // @ts-expect-error a raw mask isn't a flag set.
    Bitflags.all(Bitmask.fromBit(1));
    // @ts-expect-error a single flag isn't a flag set.
    Bitflags.all(Clear.color);
  });
});

describe('fromRaw', () => {
  it("returns the set's mask type", () => {
    expectTypeOf(Bitflags.fromRaw(Clear, 0b11)).toEqualTypeOf<MaskOf<typeof Clear>>();
    expectTypeOf(Bitflags.fromRaw(Layer, 0b1)).toEqualTypeOf<MaskOf<typeof Layer>>();
  });

  it('gives a mask that works with that set, and only that set', () => {
    const clear = Bitflags.fromRaw(Clear, 0b11);
    expectTypeOf(Bitmask.has(clear, Clear.color)).toEqualTypeOf<boolean>();
    // @ts-expect-error the result belongs to Clear, so a Pass flag is rejected.
    Bitmask.has(clear, Pass.sprite);
    // @ts-expect-error a named mask isn't a raw mask, so setBit rejects it.
    Bitmask.setBit(clear, 2);
  });

  it('takes the stored value as a plain number', () => {
    expectTypeOf(Bitflags.fromRaw).parameter(1).toEqualTypeOf<number>();
  });
});

describe('namesOf', () => {
  it("returns the set's literal flag names", () => {
    expectTypeOf(Bitflags.namesOf(Clear, Clear.color)).toEqualTypeOf<('color' | 'depth')[]>();
    expectTypeOf(Bitflags.namesOf(Layer, Layer.player)).toEqualTypeOf<('player' | 'terrain')[]>();
  });

  it('accepts NONE and ALL', () => {
    expectTypeOf(Bitflags.namesOf(Clear, Bitmask.NONE)).toEqualTypeOf<('color' | 'depth')[]>();
    expectTypeOf(Bitflags.namesOf(Clear, Bitmask.ALL)).toEqualTypeOf<('color' | 'depth')[]>();
  });

  it("takes only a mask of the set's own", () => {
    // @ts-expect-error a Pass mask doesn't belong to Clear.
    Bitflags.namesOf(Clear, Pass.sprite);
    // @ts-expect-error a raw mask doesn't belong to any set.
    Bitflags.namesOf(Clear, Bitmask.fromBit(0));
    // @ts-expect-error the first argument is the set, not a mask.
    Bitflags.namesOf(Clear.color, Clear.color);
  });

  it('reports a mismatch on the mask, since only the set decides the names', () => {
    Bitflags.namesOf(
      Clear,
      // @ts-expect-error the mask is the wrong argument, not the set.
      Pass.sprite
    );
  });
});
