import type { Brand } from '@cult-frog/types';
import type { flagNames } from './flagNames.js';

export type Bitmask<F extends string = string> = Brand<number, 'Bitmask'> & {
  readonly [flagNames]?: F;
};
