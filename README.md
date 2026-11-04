# @cult-frog/bitmask

A lightweight TypeScript library of bitmask operations and utilities for managing bitwise flags.

> **Status:** in early development. The package isn't on npm yet and its API may still change.

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

## Usage

```ts
import { Bitflags, Bitmask, type MaskOf } from '@cult-frog/bitmask';

// Name the flags once. Each name gets its own bit.
const Ability = Bitflags.fromNames(['jump', 'swim', 'fly']);
type AbilityMask = MaskOf<typeof Ability>;

let abilities: AbilityMask = Bitmask.NONE;
abilities = Bitmask.add(abilities, Ability.jump);
abilities = Bitmask.add(abilities, Ability.swim);

Bitmask.has(abilities, Ability.swim); // true
Bitmask.has(abilities, Ability.fly); // false
```

## API

### Bitflags

A flag set is a plain object that maps each flag name to a mask with a single bit set. Every mask in a set has the same type, `MaskOf<typeof set>`. Combining them keeps that type, and a parameter of that type rejects masks from other sets.

| Function | Description |
| --- | --- |
| `fromNames(names)` | Creates a flag set from a list of names, giving each the next bit from bit 0 in order. |
| `create(layout)` | Creates a flag set from an object that maps each name to its bit position, from 0 to 31. |
| `all(set)` | Every flag in `set` combined into one mask. |
| `fromRaw(set, value)` | Reads a stored number back as a mask of `set`, checking it only uses the set's bits. |
| `namesOf(set, mask)` | The names of the flags set in `mask`, in the set's order. Handy for debugging. |

```ts
const Ability = Bitflags.fromNames(['jump', 'swim', 'fly']); // jump: bit 0, swim: bit 1, fly: bit 2
const Layer = Bitflags.create({ player: 0, enemy: 1, terrain: 4 });

Bitflags.all(Ability); // 0b111
Bitmask.remove(Bitflags.all(Layer), Layer.enemy); // player and terrain only

save.abilities = abilities; // storing a mask is just the number
abilities = Bitflags.fromRaw(Ability, save.abilities); // reading it back needs fromRaw

Bitflags.namesOf(Ability, abilities); // such as ['jump', 'swim'], rather than 3
```

| Type | Description |
| --- | --- |
| `Bitflags<F>` | A flag set with the flag names `F`. |
| `MaskOf<T>` | The mask type of the flag set `T`, as in `MaskOf<typeof Ability>`. |
| `BitLayout` | The layout object that `create` takes. |

Worth knowing:

- **A set holds at most 32 flags.** A mask is a single 32-bit number, so more than 32 names or entries throws a `RangeError`.
- **Sets are frozen.** Assigning or adding a flag at runtime throws a `TypeError`, so a set can't be changed after it's made, even by code outside TypeScript.
- **`fromNames` assigns bits by position.** Inserting a name anywhere but the end moves the bits of every name after it. If masks are saved or sent anywhere, such as a save file or over the network, use `create` so each bit stays fixed.
- **Names must be unique in `fromNames`.** A repeated name throws a `RangeError`.
- **`create` checks every bit position.** One that isn't an integer from 0 to 31, or that's used by two names, throws a `RangeError`.
- **No `as const` is needed.** Flag names are inferred as literal types either way.
- **`all(set)` is not `Bitmask.ALL`.** `ALL` sets all 32 bits, while `all(set)` has only the set's own bits, so `remove(all(Layer), Layer.enemy)` leaves exactly `player` and `terrain`. A set from `create` keeps its gaps.
- **Masks are stored as plain numbers, and read back with `fromRaw`.** Writing a mask to a save file, a network message or a `Uint32Array` needs no conversion. Reading one back gives a `number`, and `fromRaw` turns it into the set's mask type. It accepts signed values too, such as from an `Int32Array`.
- **`fromRaw` checks the value against the set.** A bit that isn't one of the set's flags throws a `RangeError` that names the stray bits. That catches corrupt data, and saves made before a set's bits changed.
- **`namesOf` lists names in the set's order, not by bit.** For a set from `create`, that's the order of the layout object. Bits that aren't one of the set's flags are ignored, so `namesOf(set, ALL)` gives every name.

### Bitmask

A mask is a plain number at runtime. Every function returns a new mask, and every result is an unsigned 32-bit number, so bit 31 is never negative. At the type level there are two kinds:

- **Named masks** come from a flag set and are typed `Bitmask<F>`, where `F` is the set's flag names. You work with them by flag name.
- **Raw masks** are built from bit positions, for things like camera or collider layers, and are typed `RawBitmask`. You work with them by bit position.

| Type | Description |
| --- | --- |
| `Bitmask<F>` | A mask from the flag set with the flag names `F`. |
| `RawBitmask` | A mask built from bit positions rather than a flag set. |

Building and changing raw masks:

| Function | Description |
| --- | --- |
| `fromBit(bit)` | A raw mask with only `bit` set. |
| `fromBits(bits)` | A raw mask with every bit in `bits` set. No bits gives `NONE`. |
| `toBits(mask)` | The positions of the bits set in `mask`, lowest first. Takes either kind of mask. |
| `fromRaw(value)` | A stored number, signed or unsigned 32-bit, as a raw mask. |
| `setBit(mask, bit)` | Raw `mask` with `bit` set. |
| `clearBit(mask, bit)` | Raw `mask` with `bit` cleared. |
| `toggleBit(mask, bit)` | Raw `mask` with `bit` flipped. |
| `hasBit(mask, bit)` | Whether `bit` is set in `mask`. Takes either kind of mask. |
| `isInRange(bit)` | Whether `bit` is an integer from 0 to 31. |

Combining and testing masks:

| Function | Description |
| --- | --- |
| `add(mask, flags)` | `mask` with every bit in `flags` set as well. |
| `remove(mask, flags)` | `mask` with every bit in `flags` cleared. |
| `toggle(mask, flags)` | `mask` with every bit in `flags` flipped. Toggling two masks gives the bits that differ. |
| `intersect(mask, flags)` | Only the bits set in both `mask` and `flags`. |
| `has(mask, flags)` | Whether every bit in `flags` is set in `mask`. |
| `hasAny(mask, flags)` | Whether at least one bit in `flags` is set in `mask`. |
| `isEmpty(mask)` | Whether `mask` has no bits set. Takes either kind of mask. |
| `count(mask)` | How many bits are set in `mask`, from 0 to 32. Takes either kind of mask. |

| Constant | Description |
| --- | --- |
| `NONE` | No bits set. |
| `ALL` | All 32 bits set. |
| `MIN_BIT` | The lowest bit position, `0`. |
| `MAX_BIT` | The highest bit position, `31`. |
| `BIT_COUNT` | The number of bits in a mask, `32`, which is also the most flags a set can hold. |

```ts
let layers: RawBitmask = Bitmask.fromBits([0, 2]);
layers = Bitmask.setBit(layers, 5);
Bitmask.hasBit(layers, 2); // true

let clear: MaskOf<typeof Clear> = Bitmask.NONE;
clear = Bitmask.add(clear, Clear.depth);
Bitmask.add(clear, Pass.sprite); // compile error: Pass is a different flag set
Bitmask.add(layers, Clear.depth); // compile error: raw and named masks don't mix
Bitmask.setBit(clear, 5); // compile error: setBit takes raw masks only
```

Worth knowing:

- **Masks from different flag sets can't be mixed.** `add`, `remove`, `toggle`, `intersect`, `has` and `hasAny` take their flag names from `mask`, and reject `flags` from any other set.
- **Raw masks are treated as a set of their own.** They combine with each other through `add`, `remove`, `toggle`, `intersect`, `has` and `hasAny`, but never with a named mask, in either argument.
- **Bit positions are for raw masks, flag names are for named masks.** `setBit`, `clearBit` and `toggleBit` reject a named mask, so use `add`, `remove` and `toggle` with a flag instead. With `fromNames`, a bit position can point at a different flag after a name is inserted, but a flag name can't. `hasBit`, `isEmpty`, `count` and `toBits` only read, so they take either kind.
- **`NONE` and `ALL` fit every flag set and raw masks too.** Use them as a starting value or as either argument, as in `add(NONE, Clear.depth)` or `setBit(NONE, 3)`.
- **`ALL` sets every bit, not every flag.** `remove(ALL, Clear.depth)` still has bits 2 to 31 set as well as `color`, and so does `toggle(ALL, Clear.depth)`. Use `Bitflags.all(Clear)` for every flag in a set, and `intersect(mask, Bitflags.all(Clear))` to drop any bits outside it.
- **`Bitmask.fromRaw` checks the range only.** It accepts any integer from `-(2 ** 31)` to `2 ** 32 - 1` and throws a `RangeError` for anything else. For a mask saved from a flag set, use `Bitflags.fromRaw`, which also checks the value against the set.
- **`has(mask, NONE)` is always `true`,** since every mask contains no flags. `hasAny(mask, NONE)` is always `false`.
- **Bit positions are checked.** A bit that isn't an integer from 0 to 31 throws a `RangeError` in every function that takes one. Filter values that may be out of range with `isInRange` first.

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
