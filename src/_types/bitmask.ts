import type { Brand } from '@cult-frog/types';
import type { flagNames } from './flagNames.js';

declare const rawTag: unique symbol;

/**
 * The flag-name slot of a raw mask. It's a string no literal flag name can be assigned to, so a
 * raw mask and a named mask are never interchangeable.
 */
type Raw = string & { readonly [rawTag]: true };

/**
 * A 32-bit mask, a plain unsigned number at runtime. `F` is the flag names of the set it came
 * from, and exists only at the type level: it stops masks from different sets being mixed.
 *
 * `NONE` and `ALL` are `Bitmask<never>`, which fits every set and raw masks too.
 */
export type Bitmask<F extends string = string> = Brand<number, 'Bitmask'> & {
  readonly [flagNames]?: F;
};

/**
 * A mask built from bit positions rather than flag names, such as camera or collider layers.
 *
 * `fromBit`, `fromBits` and `fromRaw` return one, and `setBit` and `clearBit` accept and return
 * only these. Raw masks combine with each other and with `NONE` and `ALL`, never with a named
 * set's masks: a bit position means nothing to a set from `fromNames`, whose bits move when a
 * name is inserted. Use `add` and `remove` with flags to change a named mask.
 */
export type RawBitmask = Bitmask<Raw>;
