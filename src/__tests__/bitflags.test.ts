import { describe, expect, it } from 'vitest';

import { Bitflags, Bitmask } from '../index.js';

describe('Bitflags', () => {
  it('should create a bitflags instance from a string array', () => {
    const flags = Bitflags.fromNames(['foo', 'bar', 'baz']);
    expect(flags).toBeDefined();
    expect(flags.foo).toBe(Bitmask.fromBit(0));
    expect(flags.bar).toBe(Bitmask.fromBit(1));
    expect(flags.baz).toBe(Bitmask.fromBit(2));
  });

  it('should create a bitflags instance from an object specifying the bits that are set', () => {
    const flags = Bitflags.create({ foo: 1, bar: 3, baz: 6 });
    expect(flags).toBeDefined();
    expect(flags.foo).toBe(Bitmask.fromBit(1));
    expect(flags.bar).toBe(Bitmask.fromBit(3));
    expect(flags.baz).toBe(Bitmask.fromBit(6));
  });
});
