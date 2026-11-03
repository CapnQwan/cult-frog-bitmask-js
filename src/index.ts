export * as Bitflags from './bitflags.js';
export * as Bitmask from './bitmask.js';

export type { BitLayout, MaskOf, RawBitmask } from './_types/index.js';

import type { Bitflags as BitflagsType, Bitmask as BitmaskType } from './_types/index.js';

export type Bitmask<F extends string = string> = BitmaskType<F>;
export type Bitflags<F extends string> = BitflagsType<F>;
