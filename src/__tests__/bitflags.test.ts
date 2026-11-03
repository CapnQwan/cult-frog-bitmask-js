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

    it('should throw if there are more entries than bits', () => {
      const layout = Object.fromEntries(
        namesOfLength(BIT_COUNT + 1).map((name, i) => [name, i % BIT_COUNT])
      );
      expect(() => Bitflags.create(layout)).toThrow(RangeError);
      expect(() => Bitflags.create(layout)).toThrow('too many names');
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
