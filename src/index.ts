export * as Bitflags from './bitflags.js';
export * as Bitmask from './bitmask.js';

export type { BitLayout, MaskOf } from './_types/index.js';

import type { BitFlags as BitFlagsType, Bitmask as BitmaskType } from './_types/index.js';

export type Bitmask = BitmaskType;
export type Bitflags<F extends string> = BitFlagsType<F>;
