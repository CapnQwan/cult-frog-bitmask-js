import { describe, expect, it } from 'vitest';

import { BIT_COUNT, MAX_BIT } from '../constants.js';
import { Bitflags, Bitmask } from '../index.js';

const BIT_31 = 2 ** 31;

describe('Bitmask', () => {
  describe('constants', () => {
    it('should export the bit range', () => {
      expect(Bitmask.MIN_BIT).toBe(0);
      expect(Bitmask.MAX_BIT).toBe(31);
      expect(Bitmask.BIT_COUNT).toBe(32);
    });

    it('should have one bit position per bit', () => {
      expect(Bitmask.MAX_BIT - Bitmask.MIN_BIT + 1).toBe(Bitmask.BIT_COUNT);
    });

    it('should match the range isInRange accepts', () => {
      expect(Bitmask.isInRange(Bitmask.MIN_BIT)).toBe(true);
      expect(Bitmask.isInRange(Bitmask.MAX_BIT)).toBe(true);
      expect(Bitmask.isInRange(Bitmask.MIN_BIT - 1)).toBe(false);
      expect(Bitmask.isInRange(Bitmask.MAX_BIT + 1)).toBe(false);
    });
  });

  describe('NONE and ALL', () => {
    it('should have no bits set in NONE', () => {
      expect(Bitmask.NONE).toBe(0);
      for (let i = 0; i < BIT_COUNT; i++) expect(Bitmask.hasBit(Bitmask.NONE, i)).toBe(false);
    });

    it('should have every bit set in ALL, as an unsigned number', () => {
      expect(Bitmask.ALL).toBe(0xffffffff);
      for (let i = 0; i < BIT_COUNT; i++) expect(Bitmask.hasBit(Bitmask.ALL, i)).toBe(true);
    });
  });

  describe('isInRange', () => {
    it('should accept integers from 0 to 31', () => {
      for (let i = 0; i < BIT_COUNT; i++) expect(Bitmask.isInRange(i)).toBe(true);
    });

    it('should reject anything else', () => {
      for (const bit of [-1, BIT_COUNT, 1.5, Number.NaN, Number.POSITIVE_INFINITY])
        expect(Bitmask.isInRange(bit)).toBe(false);
    });
  });

  describe('fromRaw', () => {
    it('should keep unsigned values as they are', () => {
      expect(Bitmask.fromRaw(0)).toBe(Bitmask.NONE);
      expect(Bitmask.fromRaw(0b101)).toBe(Bitmask.fromBits([0, 2]));
      expect(Bitmask.fromRaw(2 ** 32 - 1)).toBe(Bitmask.ALL);
    });

    it('should turn signed values into the same mask, unsigned', () => {
      expect(Bitmask.fromRaw(-1)).toBe(Bitmask.ALL);
      expect(Bitmask.fromRaw(-(2 ** 31))).toBe(BIT_31);
      expect(Bitmask.fromRaw(1 << 31)).toBe(Bitmask.fromBit(MAX_BIT));
    });

    it('should read values from typed arrays', () => {
      expect(Bitmask.fromRaw(new Int32Array([-1])[0] ?? 0)).toBe(Bitmask.ALL);
      expect(Bitmask.fromRaw(new Uint32Array([BIT_31])[0] ?? 0)).toBe(BIT_31);
    });

    it('should throw a RangeError if the value is out of range', () => {
      expect(() => Bitmask.fromRaw(2 ** 32)).toThrow(RangeError);
      expect(() => Bitmask.fromRaw(-(2 ** 31) - 1)).toThrow(RangeError);
      expect(() => Bitmask.fromRaw(2 ** 32)).toThrow('raw value out of range');
    });

    it('should throw a RangeError if the value is not an integer', () => {
      for (const value of [1.5, Number.NaN, Number.POSITIVE_INFINITY])
        expect(() => Bitmask.fromRaw(value)).toThrow(RangeError);
    });
  });

  describe('fromBit', () => {
    it('should create a bitmask from a bit', () => {
      for (let i = 0; i < BIT_COUNT; i++) expect(Bitmask.fromBit(i)).toBe((1 << i) >>> 0);
    });

    it('should return bit 31 as a positive number', () => {
      expect(Bitmask.fromBit(MAX_BIT)).toBe(BIT_31);
    });

    it('should throw an error if the bit is greater than the bit count', () => {
      expect(() => Bitmask.fromBit(BIT_COUNT)).toThrow('Bitmask: bit out of range');
    });

    it('should throw an error if the bit is negative', () => {
      expect(() => Bitmask.fromBit(-1)).toThrow('Bitmask: bit out of range');
    });

    it('should name the expected range and the bad bit in the error', () => {
      expect(() => Bitmask.fromBit(40)).toThrow('expected an integer from 0 to 31, got 40');
    });

    it('should throw a RangeError if the bit is not an integer', () => {
      expect(() => Bitmask.fromBit(1.5)).toThrow(RangeError);
      expect(() => Bitmask.fromBit(Number.NaN)).toThrow(RangeError);
    });
  });

  describe('fromBits', () => {
    it('should set every given bit', () => {
      expect(Bitmask.fromBits([0, 2, 31])).toBe(0b101 + BIT_31);
    });

    it('should return NONE for no bits', () => {
      expect(Bitmask.fromBits([])).toBe(Bitmask.NONE);
    });

    it('should ignore repeated bits', () => {
      expect(Bitmask.fromBits([3, 3, 3])).toBe(Bitmask.fromBit(3));
    });

    it('should throw a RangeError if any bit is out of range', () => {
      expect(() => Bitmask.fromBits([0, 1, BIT_COUNT])).toThrow(RangeError);
    });
  });

  describe('toBits', () => {
    it('should list the set bit positions, lowest first', () => {
      expect(Bitmask.toBits(Bitmask.fromRaw(0b1010))).toEqual([1, 3]);
      expect(Bitmask.toBits(Bitmask.fromBits([31, 4, 0]))).toEqual([0, 4, 31]);
    });

    it('should give an empty array for NONE and every position for ALL', () => {
      expect(Bitmask.toBits(Bitmask.NONE)).toEqual([]);
      expect(Bitmask.toBits(Bitmask.ALL)).toEqual([...Array(BIT_COUNT).keys()]);
    });

    it('should give bit 31 as 31', () => {
      expect(Bitmask.toBits(Bitmask.fromBit(MAX_BIT))).toEqual([MAX_BIT]);
    });

    it('should undo fromBits and match count', () => {
      let value = 0x12345678;
      for (let i = 0; i < 1000; i++) {
        value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
        const mask = Bitmask.fromRaw(value);
        const bits = Bitmask.toBits(mask);
        expect(Bitmask.fromBits(bits)).toBe(mask);
        expect(bits).toHaveLength(Bitmask.count(mask));
      }
    });

    it('should read named masks too', () => {
      const Clear = Bitflags.fromNames(['color', 'depth', 'stencil']);
      expect(Bitmask.toBits(Bitmask.add(Clear.color, Clear.stencil))).toEqual([0, 2]);
    });
  });

  describe('add', () => {
    it('should combine the bits of both masks', () => {
      const mask1 = Bitmask.fromBit(1);
      const mask2 = Bitmask.fromBit(31);
      const mask3 = Bitmask.fromBit(15);
      const union = Bitmask.add(mask1, mask2);
      expect(Bitmask.has(union, mask1)).toBe(true);
      expect(Bitmask.has(union, mask2)).toBe(true);
      expect(Bitmask.has(union, union)).toBe(true);
      expect(Bitmask.hasAny(union, Bitmask.ALL)).toBe(true);
      expect(Bitmask.has(union, Bitmask.NONE)).toBe(true);
      expect(Bitmask.has(union, mask3)).toBe(false);
    });

    it('should not change a mask that already has the flags', () => {
      const mask = Bitmask.fromBits([1, 2]);
      expect(Bitmask.add(mask, Bitmask.fromBit(1))).toBe(mask);
    });

    it('should treat NONE as adding nothing', () => {
      const mask = Bitmask.fromBits([1, 2]);
      expect(Bitmask.add(mask, Bitmask.NONE)).toBe(mask);
      expect(Bitmask.add(Bitmask.NONE, mask)).toBe(mask);
    });

    it('should return ALL as a positive number when combining every bit', () => {
      expect(Bitmask.add(Bitmask.fromBit(MAX_BIT), Bitmask.fromBits([...Array(31).keys()]))).toBe(
        Bitmask.ALL
      );
    });
  });

  describe('remove', () => {
    it('should clear the given flags and keep the rest', () => {
      const mask = Bitmask.fromBits([0, 1, 2]);
      expect(Bitmask.remove(mask, Bitmask.fromBits([0, 2]))).toBe(Bitmask.fromBit(1));
    });

    it('should not change a mask that lacks the flags', () => {
      const mask = Bitmask.fromBits([1, 2]);
      expect(Bitmask.remove(mask, Bitmask.fromBit(5))).toBe(mask);
    });

    it('should keep the result unsigned', () => {
      expect(Bitmask.remove(Bitmask.ALL, Bitmask.fromBit(0))).toBe(0xfffffffe);
      expect(Bitmask.remove(Bitmask.ALL, Bitmask.fromBit(MAX_BIT))).toBe(0x7fffffff);
    });

    it('should remove everything when removing ALL', () => {
      expect(Bitmask.remove(Bitmask.fromBits([3, 31]), Bitmask.ALL)).toBe(Bitmask.NONE);
    });
  });

  describe('toggle', () => {
    it('should clear flags that are set and set flags that are clear', () => {
      const mask = Bitmask.fromBits([0, 1]);
      expect(Bitmask.toggle(mask, Bitmask.fromBits([1, 2]))).toBe(Bitmask.fromBits([0, 2]));
    });

    it('should give back the original mask when toggled twice', () => {
      const mask = Bitmask.fromBits([0, 5, 31]);
      const flags = Bitmask.fromBits([5, 9]);
      expect(Bitmask.toggle(Bitmask.toggle(mask, flags), flags)).toBe(mask);
    });

    it('should give the bits that differ between two masks', () => {
      const previous = Bitmask.fromBits([0, 1, 2]);
      const current = Bitmask.fromBits([1, 2, 3]);
      expect(Bitmask.toggle(previous, current)).toBe(Bitmask.fromBits([0, 3]));
      expect(Bitmask.toggle(current, current)).toBe(Bitmask.NONE);
    });

    it('should treat NONE as toggling nothing', () => {
      const mask = Bitmask.fromBits([1, 2]);
      expect(Bitmask.toggle(mask, Bitmask.NONE)).toBe(mask);
      expect(Bitmask.toggle(Bitmask.NONE, mask)).toBe(mask);
    });

    it('should invert the mask when toggling ALL', () => {
      expect(Bitmask.toggle(Bitmask.fromBit(0), Bitmask.ALL)).toBe(0xfffffffe);
      expect(Bitmask.toggle(Bitmask.ALL, Bitmask.ALL)).toBe(Bitmask.NONE);
    });

    it('should keep the result unsigned', () => {
      expect(Bitmask.toggle(Bitmask.NONE, Bitmask.fromBit(MAX_BIT))).toBe(BIT_31);
      expect(Bitmask.toggle(Bitmask.ALL, Bitmask.fromBit(MAX_BIT))).toBe(0x7fffffff);
    });
  });

  describe('intersect', () => {
    it('should keep only the bits set in both masks', () => {
      const mask = Bitmask.fromBits([0, 1, 2]);
      expect(Bitmask.intersect(mask, Bitmask.fromBits([1, 2, 3]))).toBe(Bitmask.fromBits([1, 2]));
    });

    it('should give NONE for masks with no bits in common', () => {
      expect(Bitmask.intersect(Bitmask.fromBits([0, 1]), Bitmask.fromBits([2, 3]))).toBe(
        Bitmask.NONE
      );
    });

    it('should give NONE when either mask is NONE', () => {
      const mask = Bitmask.fromBits([1, 2]);
      expect(Bitmask.intersect(mask, Bitmask.NONE)).toBe(Bitmask.NONE);
      expect(Bitmask.intersect(Bitmask.NONE, mask)).toBe(Bitmask.NONE);
    });

    it('should give back the other mask when either mask is ALL', () => {
      const mask = Bitmask.fromBits([1, 2]);
      expect(Bitmask.intersect(mask, Bitmask.ALL)).toBe(mask);
      expect(Bitmask.intersect(Bitmask.ALL, mask)).toBe(mask);
      expect(Bitmask.intersect(Bitmask.ALL, Bitmask.ALL)).toBe(Bitmask.ALL);
    });

    it('should drop bits outside a flag set when intersected with all(set)', () => {
      const Clear = Bitflags.fromNames(['color', 'depth']);
      const stray = Bitmask.add(Clear.color, Bitmask.ALL);
      expect(Bitmask.intersect(stray, Bitflags.all(Clear))).toBe(Bitflags.all(Clear));
    });

    it('should keep the result unsigned', () => {
      expect(Bitmask.intersect(Bitmask.ALL, Bitmask.fromBit(MAX_BIT))).toBe(BIT_31);
    });
  });

  describe('has', () => {
    it('should check if a bitmask has a bitmask', () => {
      const mask = Bitmask.fromBit(1);
      const mask2 = Bitmask.fromBit(31);
      const mask3 = Bitmask.fromBit(31);
      expect(Bitmask.has(mask, mask2)).toBe(false);
      expect(Bitmask.has(mask2, mask3)).toBe(true);
      expect(Bitmask.has(Bitmask.ALL, mask)).toBe(true);
      expect(Bitmask.has(Bitmask.ALL, mask2)).toBe(true);
      expect(Bitmask.has(Bitmask.NONE, mask)).toBe(false);
      expect(Bitmask.has(Bitmask.NONE, mask2)).toBe(false);
    });

    it('should need every flag to be set', () => {
      const mask = Bitmask.fromBits([0, 1]);
      expect(Bitmask.has(mask, Bitmask.fromBits([0, 1]))).toBe(true);
      expect(Bitmask.has(mask, Bitmask.fromBits([0, 1, 2]))).toBe(false);
    });

    it('should be true for ALL in ALL', () => {
      expect(Bitmask.has(Bitmask.ALL, Bitmask.ALL)).toBe(true);
    });

    it('should be true for NONE in any mask', () => {
      expect(Bitmask.has(Bitmask.NONE, Bitmask.NONE)).toBe(true);
      expect(Bitmask.has(Bitmask.fromBit(4), Bitmask.NONE)).toBe(true);
    });
  });

  describe('hasAny', () => {
    it('should be true when at least one flag is set', () => {
      const mask = Bitmask.fromBits([0, 1]);
      expect(Bitmask.hasAny(mask, Bitmask.fromBits([1, 2]))).toBe(true);
      expect(Bitmask.hasAny(mask, Bitmask.fromBits([2, 3]))).toBe(false);
    });

    it('should work with bit 31', () => {
      const mask = Bitmask.fromBit(MAX_BIT);
      expect(Bitmask.hasAny(mask, Bitmask.fromBit(MAX_BIT))).toBe(true);
      expect(Bitmask.hasAny(Bitmask.ALL, mask)).toBe(true);
    });

    it('should be false for NONE', () => {
      expect(Bitmask.hasAny(Bitmask.ALL, Bitmask.NONE)).toBe(false);
      expect(Bitmask.hasAny(Bitmask.NONE, Bitmask.ALL)).toBe(false);
    });
  });

  describe('setBit', () => {
    it('should set the bit and keep the rest', () => {
      expect(Bitmask.setBit(Bitmask.fromBit(0), 2)).toBe(Bitmask.fromBits([0, 2]));
    });

    it('should not change a mask that already has the bit', () => {
      const mask = Bitmask.fromBits([0, 2]);
      expect(Bitmask.setBit(mask, 2)).toBe(mask);
    });

    it('should return bit 31 as a positive number', () => {
      expect(Bitmask.setBit(Bitmask.NONE, MAX_BIT)).toBe(BIT_31);
    });

    it('should throw a RangeError if the bit is out of range', () => {
      expect(() => Bitmask.setBit(Bitmask.NONE, BIT_COUNT)).toThrow(RangeError);
      expect(() => Bitmask.setBit(Bitmask.NONE, -1)).toThrow(RangeError);
    });
  });

  describe('clearBit', () => {
    it('should clear the bit and keep the rest', () => {
      expect(Bitmask.clearBit(Bitmask.fromBits([0, 2]), 2)).toBe(Bitmask.fromBit(0));
    });

    it('should not change a mask that lacks the bit', () => {
      const mask = Bitmask.fromBit(0);
      expect(Bitmask.clearBit(mask, 5)).toBe(mask);
    });

    it('should keep the result unsigned', () => {
      expect(Bitmask.clearBit(Bitmask.ALL, MAX_BIT)).toBe(0x7fffffff);
      expect(Bitmask.clearBit(Bitmask.ALL, 0)).toBe(0xfffffffe);
    });

    it('should throw a RangeError if the bit is out of range', () => {
      expect(() => Bitmask.clearBit(Bitmask.ALL, BIT_COUNT)).toThrow(RangeError);
      expect(() => Bitmask.clearBit(Bitmask.ALL, -1)).toThrow(RangeError);
    });
  });

  describe('toggleBit', () => {
    it('should set the bit if it is clear and keep the rest', () => {
      expect(Bitmask.toggleBit(Bitmask.fromBit(0), 2)).toBe(Bitmask.fromBits([0, 2]));
    });

    it('should clear the bit if it is set and keep the rest', () => {
      expect(Bitmask.toggleBit(Bitmask.fromBits([0, 2]), 2)).toBe(Bitmask.fromBit(0));
    });

    it('should keep the result unsigned', () => {
      expect(Bitmask.toggleBit(Bitmask.NONE, MAX_BIT)).toBe(BIT_31);
      expect(Bitmask.toggleBit(Bitmask.ALL, MAX_BIT)).toBe(0x7fffffff);
      expect(Bitmask.toggleBit(Bitmask.ALL, 0)).toBe(0xfffffffe);
    });

    it('should throw a RangeError if the bit is out of range', () => {
      expect(() => Bitmask.toggleBit(Bitmask.NONE, BIT_COUNT)).toThrow(RangeError);
      expect(() => Bitmask.toggleBit(Bitmask.NONE, -1)).toThrow(RangeError);
      expect(() => Bitmask.toggleBit(Bitmask.NONE, 1.5)).toThrow(RangeError);
    });
  });

  describe('hasBit', () => {
    it('should check if a bitmask has a bit', () => {
      const mask = Bitmask.fromBit(1);
      const mask2 = Bitmask.fromBit(31);
      expect(Bitmask.hasBit(mask, 1)).toBe(true);
      expect(Bitmask.hasBit(mask, 0)).toBe(false);
      expect(Bitmask.hasBit(mask2, 31)).toBe(true);
      expect(Bitmask.hasBit(mask2, 30)).toBe(false);
    });

    it('should throw a RangeError if the bit is out of range', () => {
      expect(() => Bitmask.hasBit(Bitmask.ALL, BIT_COUNT)).toThrow(RangeError);
      expect(() => Bitmask.hasBit(Bitmask.ALL, -1)).toThrow(RangeError);
    });
  });

  describe('isEmpty', () => {
    it('should be true for NONE', () => {
      expect(Bitmask.isEmpty(Bitmask.NONE)).toBe(true);
      expect(Bitmask.isEmpty(Bitmask.fromBits([]))).toBe(true);
      expect(Bitmask.isEmpty(Bitmask.fromRaw(0))).toBe(true);
    });

    it('should be false when any bit is set', () => {
      expect(Bitmask.isEmpty(Bitmask.fromBit(0))).toBe(false);
      expect(Bitmask.isEmpty(Bitmask.fromBit(MAX_BIT))).toBe(false);
      expect(Bitmask.isEmpty(Bitmask.ALL)).toBe(false);
    });

    it('should be true once every bit is cleared', () => {
      const mask = Bitmask.fromBits([3, 31]);
      expect(Bitmask.isEmpty(Bitmask.remove(mask, mask))).toBe(true);
      expect(Bitmask.isEmpty(Bitmask.intersect(mask, Bitmask.fromBit(4)))).toBe(true);
    });
  });

  describe('count', () => {
    function countByLoop(mask: number): number {
      let n = 0;
      for (let i = 0; i < BIT_COUNT; i++) n += (mask >>> i) & 1;
      return n;
    }

    it('should be 0 for NONE and 32 for ALL', () => {
      expect(Bitmask.count(Bitmask.NONE)).toBe(0);
      expect(Bitmask.count(Bitmask.ALL)).toBe(32);
    });

    it('should be 1 for every single bit, including bit 31', () => {
      for (let i = 0; i < BIT_COUNT; i++) expect(Bitmask.count(Bitmask.fromBit(i))).toBe(1);
    });

    it('should add up bits that sit next to each other', () => {
      expect(Bitmask.count(Bitmask.fromBits([0, 1, 3]))).toBe(3);
      expect(Bitmask.count(Bitmask.fromRaw(0x55555555))).toBe(16);
      expect(Bitmask.count(Bitmask.fromRaw(0xaaaaaaaa))).toBe(16);
      expect(Bitmask.count(Bitmask.fromRaw(0xffff0000))).toBe(16);
    });

    it('should count the lowest n bits as n', () => {
      for (let n = 0; n <= BIT_COUNT; n++)
        expect(Bitmask.count(Bitmask.fromBits([...Array(n).keys()]))).toBe(n);
    });

    it('should match a bit-by-bit count', () => {
      let value = 0x12345678;
      for (let i = 0; i < 1000; i++) {
        value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
        expect(Bitmask.count(Bitmask.fromRaw(value))).toBe(countByLoop(value));
      }
    });

    it('should count named masks too', () => {
      const Clear = Bitflags.fromNames(['color', 'depth', 'stencil']);
      expect(Bitmask.count(Bitflags.all(Clear))).toBe(3);
      expect(Bitmask.count(Bitmask.add(Clear.color, Clear.stencil))).toBe(2);
    });
  });
});
