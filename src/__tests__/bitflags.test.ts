import { describe, expect, it } from 'vitest';

import { BIT_COUNT } from '../constants.js';
import { Bitflags, Bitmask } from '../index.js';

import type { MaskOf } from '../index.js';

const namesOfLength = (length: number): string[] => Array.from({ length }, (_, i) => `flag${i}`);

describe('Bitflags', () => {
  describe('fromNames', () => {
    it('should create a bitflags instance from a string array', () => {
      const flags = Bitflags.fromNames(['foo', 'bar', 'baz']);
      expect(flags).toBeDefined();
      expect(flags.foo).toBe(Bitmask.fromBit(0));
      expect(Bitmask.hasBit(flags.foo, 0)).toBe(true);
      expect(flags.bar).toBe(Bitmask.fromBit(1));
      expect(Bitmask.hasBit(flags.bar, 1)).toBe(true);
      expect(flags.baz).toBe(Bitmask.fromBit(2));
      expect(Bitmask.hasBit(flags.baz, 2)).toBe(true);
    });

    it('should only contain the given names', () => {
      const flags = Bitflags.fromNames(['foo', 'bar']);
      expect(Object.keys(flags)).toEqual(['foo', 'bar']);
    });

    it('should create an empty set from no names', () => {
      expect(Bitflags.fromNames([])).toEqual({});
    });

    it('should accept the maximum number of names', () => {
      const flags = Bitflags.fromNames(namesOfLength(BIT_COUNT));
      expect(Object.keys(flags)).toHaveLength(BIT_COUNT);
      expect(flags[`flag${BIT_COUNT - 1}`]).toBe(Bitmask.fromBit(BIT_COUNT - 1));
    });

    it('should throw if there are more names than bits', () => {
      expect(() => Bitflags.fromNames(namesOfLength(BIT_COUNT + 1))).toThrow(RangeError);
      expect(() => Bitflags.fromNames(namesOfLength(BIT_COUNT + 1))).toThrow('too many names');
    });

    it('should throw if a name is repeated', () => {
      expect(() => Bitflags.fromNames(['foo', 'bar', 'foo'])).toThrow(RangeError);
      expect(() => Bitflags.fromNames(['foo', 'bar', 'foo'])).toThrow('duplicate names');
    });
  });

  describe('create', () => {
    it('should create a bitflags instance from an object specifying the bits that are set', () => {
      const flags = Bitflags.create({ foo: 1, bar: 3, baz: 6 });
      expect(flags).toBeDefined();
      expect(flags.foo).toBe(Bitmask.fromBit(1));
      expect(Bitmask.hasBit(flags.foo, 1)).toBe(true);
      expect(flags.bar).toBe(Bitmask.fromBit(3));
      expect(Bitmask.hasBit(flags.bar, 3)).toBe(true);
      expect(flags.baz).toBe(Bitmask.fromBit(6));
      expect(Bitmask.hasBit(flags.baz, 6)).toBe(true);
    });

    it('should accept the lowest and highest bits', () => {
      const flags = Bitflags.create({ low: 0, high: 31 });
      expect(flags.low).toBe(1);
      expect(flags.high).toBe(2 ** 31);
    });

    it('should create an empty set from an empty layout', () => {
      expect(Bitflags.create({})).toEqual({});
    });

    it('should throw if a bit is out of range', () => {
      expect(() => Bitflags.create({ foo: -1 })).toThrow(RangeError);
      expect(() => Bitflags.create({ foo: BIT_COUNT })).toThrow(RangeError);
      expect(() => Bitflags.create({ foo: 1.5 })).toThrow(RangeError);
    });

    it('should throw if two names share a bit', () => {
      expect(() => Bitflags.create({ foo: 1, bar: 2, baz: 1 })).toThrow(RangeError);
      expect(() => Bitflags.create({ foo: 1, bar: 2, baz: 1 })).toThrow('duplicate bits');
    });

    it('should report an out-of-range bit before a duplicate', () => {
      expect(() => Bitflags.create({ foo: 40, bar: 40 })).toThrow('bit out of range');
      expect(() => Bitflags.create({ foo: Number.NaN, bar: Number.NaN })).toThrow(
        'bit out of range'
      );
    });

    it('should return a frozen set', () => {
      expect(Object.isFrozen(Bitflags.create({ foo: 1 }))).toBe(true);
      expect(Object.isFrozen(Bitflags.fromNames(['foo']))).toBe(true);
    });

    it('should throw if a flag is changed or added at runtime', () => {
      const flags = Bitflags.create({ foo: 1 }) as Record<string, number>;
      expect(() => {
        flags.foo = 5;
      }).toThrow(TypeError);
      expect(() => {
        flags.bar = 2;
      }).toThrow(TypeError);
      expect(flags.foo).toBe(Bitmask.fromBit(1));
    });

    it('should throw if there are more entries than bits', () => {
      const layout = Object.fromEntries(
        namesOfLength(BIT_COUNT + 1).map((name, i) => [name, i % BIT_COUNT])
      );
      expect(() => Bitflags.create(layout)).toThrow(RangeError);
      expect(() => Bitflags.create(layout)).toThrow('too many names');
    });
  });

  describe('all', () => {
    it('should combine every flag in the set', () => {
      const Clear = Bitflags.fromNames(['color', 'depth', 'stencil']);
      expect(Bitflags.all(Clear)).toBe(0b111);
    });

    it('should keep the gaps of a set from create', () => {
      const Layer = Bitflags.create({ player: 0, terrain: 4, top: 31 });
      expect(Bitflags.all(Layer)).toBe(Bitmask.fromBits([0, 4, 31]));
    });

    it('should return NONE for an empty set', () => {
      expect(Bitflags.all(Bitflags.fromNames([]))).toBe(Bitmask.NONE);
    });

    it('should equal ALL for a full set of 32 flags', () => {
      expect(Bitflags.all(Bitflags.fromNames(namesOfLength(BIT_COUNT)))).toBe(Bitmask.ALL);
    });

    it('should leave only the other flags after a remove, unlike ALL', () => {
      const Clear = Bitflags.fromNames(['color', 'depth', 'stencil']);
      const allButDepth = Bitmask.remove(Bitflags.all(Clear), Clear.depth);
      expect(allButDepth).toBe(Bitmask.add(Clear.color, Clear.stencil));
      expect(Bitmask.remove(Bitmask.ALL, Clear.depth)).not.toBe(allButDepth);
    });
  });

  describe('fromRaw', () => {
    const Layer = Bitflags.create({ player: 0, terrain: 4, top: 31 });

    it('should round-trip a stored mask', () => {
      const layers = Bitmask.add(Layer.player, Layer.top);
      const stored: number = layers;
      expect(Bitflags.fromRaw(Layer, stored)).toBe(layers);
    });

    it('should accept NONE and every flag at once', () => {
      expect(Bitflags.fromRaw(Layer, 0)).toBe(Bitmask.NONE);
      expect(Bitflags.fromRaw(Layer, Bitflags.all(Layer))).toBe(Bitflags.all(Layer));
    });

    it('should read a signed value with bit 31 set as unsigned', () => {
      const signed = new Int32Array([Layer.top])[0] ?? 0;
      expect(signed).toBeLessThan(0);
      expect(Bitflags.fromRaw(Layer, signed)).toBe(Layer.top);
    });

    it('should throw a RangeError if the value has bits outside the set', () => {
      expect(() => Bitflags.fromRaw(Layer, 0b10)).toThrow(RangeError);
      expect(() => Bitflags.fromRaw(Layer, 0b10)).toThrow('bits outside the set');
    });

    it('should name the stray bits in the error, unsigned', () => {
      const Low = Bitflags.fromNames(['a']);
      expect(() => Bitflags.fromRaw(Low, 0b110)).toThrow('got 0x6 in 6');
      expect(() => Bitflags.fromRaw(Low, -(2 ** 31))).toThrow('got 0x80000000');
    });

    it('should throw for a value that was saved before its set changed', () => {
      const v1 = Bitflags.fromNames(['jump', 'swim', 'fly']);
      const saved: number = v1.fly;
      const v2 = Bitflags.fromNames(['jump', 'swim']);
      expect(() => Bitflags.fromRaw(v2, saved)).toThrow('bits outside the set');
    });

    it('should throw the Bitmask range error for a value that is not a 32-bit integer', () => {
      expect(() => Bitflags.fromRaw(Layer, 2 ** 32)).toThrow('raw value out of range');
      expect(() => Bitflags.fromRaw(Layer, 1.5)).toThrow(RangeError);
      expect(() => Bitflags.fromRaw(Layer, Number.NaN)).toThrow(RangeError);
    });
  });

  describe('namesOf', () => {
    const Clear = Bitflags.fromNames(['color', 'depth', 'stencil']);

    it('should give the names of the flags that are set', () => {
      expect(Bitflags.namesOf(Clear, Bitmask.add(Clear.color, Clear.stencil))).toEqual([
        'color',
        'stencil',
      ]);
      expect(Bitflags.namesOf(Clear, Clear.depth)).toEqual(['depth']);
    });

    it('should give an empty array for NONE and every name for ALL', () => {
      expect(Bitflags.namesOf(Clear, Bitmask.NONE)).toEqual([]);
      expect(Bitflags.namesOf(Clear, Bitmask.ALL)).toEqual(['color', 'depth', 'stencil']);
      expect(Bitflags.namesOf(Clear, Bitflags.all(Clear))).toEqual(['color', 'depth', 'stencil']);
    });

    it('should find names by their bit in a set from create, gaps and all', () => {
      const Layer = Bitflags.create({ player: 0, enemy: 1, terrain: 4, top: 31 });
      expect(Bitflags.namesOf(Layer, Bitmask.add(Layer.player, Layer.terrain))).toEqual([
        'player',
        'terrain',
      ]);
      expect(Bitflags.namesOf(Layer, Layer.top)).toEqual(['top']);
    });

    it('should list names in the order the set lists them, not by bit', () => {
      const Swapped = Bitflags.create({ b: 1, a: 0 });
      expect(Bitflags.namesOf(Swapped, Swapped.a)).toEqual(['a']);
      expect(Bitflags.namesOf(Swapped, Bitflags.all(Swapped))).toEqual(['b', 'a']);
    });

    it('should ignore bits that are not flags of the set', () => {
      const stray = Bitmask.add(Clear.depth, Bitmask.ALL);
      expect(Bitflags.namesOf(Clear, Bitmask.remove(stray, Bitflags.all(Clear)))).toEqual([]);
    });

    it('should give no names for an empty set', () => {
      expect(Bitflags.namesOf(Bitflags.fromNames([]), Bitmask.ALL)).toEqual([]);
    });
  });

  describe('masks from a flag set', () => {
    it('should combine and test with Bitmask operations', () => {
      const Ability = Bitflags.fromNames(['jump', 'swim', 'fly']);
      let abilities: MaskOf<typeof Ability> = Bitmask.NONE;
      abilities = Bitmask.add(abilities, Ability.jump);
      abilities = Bitmask.add(abilities, Ability.swim);
      expect(Bitmask.has(abilities, Ability.jump)).toBe(true);
      expect(Bitmask.has(abilities, Ability.swim)).toBe(true);
      expect(Bitmask.has(abilities, Ability.fly)).toBe(false);
      expect(Bitmask.has(Bitmask.remove(abilities, Ability.jump), Ability.jump)).toBe(false);
    });
  });
});
