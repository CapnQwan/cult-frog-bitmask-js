import type { Bitmask } from './bitmask.js';

/** Flag names mapped to bit positions (0-31), as passed to `Bitflags.create`. */
export type BitLayout = Readonly<Record<string, number>>;

/**
 * A read-only set of named single-bit masks that all share one mask type. Sets from `create`
 * and `fromNames` are also frozen, so they're read-only at runtime, not only in TypeScript.
 */
export type Bitflags<F extends string> = { readonly [K in F]: Bitmask<F> };

/** The mask type of a flag set: `type ClearMask = MaskOf<typeof Clear>`. */
export type MaskOf<T> = T[keyof T];
