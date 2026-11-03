import type { Bitmask } from './bitmask.js';

/** Flag names mapped to bit positions (0-31), as passed to `BitFlags.create`. */
export type BitLayout = Readonly<Record<string, number>>;

/** A frozen set of named single-bit masks that all share one mask type. */
export type BitFlags<F extends string> = { readonly [K in F]: Bitmask<F> };

/** The mask type of a flag set: `type ClearMask = MaskOf<typeof Clear>`. */
export type MaskOf<T> = T[keyof T];
