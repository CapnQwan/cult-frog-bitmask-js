import { describe, expect, it } from 'vitest';

import { BIT_COUNT } from '../constants.js';
import { Bitmask } from '../index.js';

describe('Bitmask', () => {
  it('should create a bitmask from a bit', () => {
    for (let i = 0; i < BIT_COUNT; i++) expect(Bitmask.fromBit(i)).toBe((1 << i) >>> 0);
  });
});
