# @cult-frog/bitmask

A lightweight TypeScript library of bitmask operations and utilities for managing bitwise flags.

> **Status:** in early development. The package isn't on npm yet and has no public API so far.

## What is a bitmask?

A bitmask stores a set of on/off flags in the bits of a single integer, so one number can hold many booleans. Combining or testing flags takes a single bitwise operation, which makes masks compact and cheap to compare. That suits work that checks a lot of flags often, such as matching entity components or filtering physics collisions.

Here are the underlying operations in plain TypeScript:

```ts
const CAN_JUMP = 1 << 0; // 0b001
const CAN_SWIM = 1 << 1; // 0b010
const CAN_FLY = 1 << 2; // 0b100

let abilities = CAN_JUMP | CAN_SWIM; // 0b011: set flags with OR

const canSwim = (abilities & CAN_SWIM) !== 0; // true: test a flag with AND
abilities &= ~CAN_JUMP; // 0b010: clear a flag with AND NOT
abilities ^= CAN_FLY; // 0b110: toggle a flag with XOR
```

Two traps to watch for:

- **Bitwise operators work on 32 bits.** JavaScript converts operands to signed 32-bit integers, so a single number holds at most 32 flags. `1 << 31` is negative, and `1 << 32` wraps around to `1`.
- **`&` binds more loosely than `!==`.** `abilities & CAN_SWIM !== 0` compares first, so the parentheses in the example above are required.

## Requirements

- Node.js 20.19 or later, or any modern bundler.
- The package is published as an ES module only.

## Development

```sh
pnpm install
pnpm check      # lint and format check with Biome
pnpm typecheck  # type-check with TypeScript
pnpm test       # run the tests with Vitest
pnpm build      # compile to dist/
```

## License

[MIT](./LICENSE)
