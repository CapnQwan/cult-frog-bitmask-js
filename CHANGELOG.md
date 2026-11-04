# Changelog

All notable changes to this package are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this package follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

First release: typed 32-bit masks, and named flag sets that keep masks from
different sets apart at compile time.

### Added

- **Flag sets** (`Bitflags`), which name the bits of a mask once so the rest of
  the code works with flags by name.
  - `fromNames(names)`: gives each name the next bit, in order from bit 0.
  - `create(layout)`: maps each name to a fixed bit position. Use it for masks
    that are saved or sent over the network, since adding a flag never moves
    the others.
  - `all(set)`: every flag in a set combined. Unlike `Bitmask.ALL`, which sets
    all 32 bits, it has only the set's own bits.
  - `fromRaw(set, value)`: reads a stored number back as a mask of the set. It
    throws if the value has a bit that isn't one of the set's flags, which
    catches corrupt data and saves made before a set's bits changed.
  - `namesOf(set, mask)`: the names of the flags set in a mask, in the set's
    order, for debugging and logging. Bits outside the set are ignored.

  Every mask in a set shares one type, `MaskOf<typeof set>`, so mixing masks
  from two sets is a compile error. Flag names are inferred as literal types
  without `as const`. Sets are frozen, so they can't be changed after they're
  made. A set holds at most 32 flags, and a repeated name, a repeated bit or a
  bit outside 0 to 31 throws a `RangeError`.

- **Mask operations** (`Bitmask`) for combining and testing masks of one set:
  `add`, `remove`, `toggle`, `intersect`, `has` and `hasAny`, plus the
  constants `NONE` and `ALL`, which fit every set. `isEmpty`, `count` and
  `toBits` read a mask of either kind: whether it has no bits set, how many it
  has, and which positions they are. Every result is an unsigned 32-bit number,
  so bit 31 is never negative. `MIN_BIT`, `MAX_BIT` and `BIT_COUNT` give the
  bit range.

- **Raw masks** (`RawBitmask`), for masks built from bit positions rather than
  flag names, such as camera or collider layers.
  - `fromBit`, `fromBits`, `setBit`, `clearBit`, `toggleBit` and `hasBit` work
    by bit position, and `isInRange` checks a position before use. A position
    outside 0 to 31 throws a `RangeError`.
  - `fromRaw(value)` reads a stored number back as a raw mask. It accepts
    signed and unsigned 32-bit values, such as from an `Int32Array` or a
    `Uint32Array`, and throws a `RangeError` for anything else.

  Raw masks combine with each other and with `NONE` and `ALL`, but never with a
  named mask. `setBit`, `clearBit` and `toggleBit` reject named masks, since a
  bit position can point at a different flag after a name is inserted into a
  `fromNames` list. Use `add`, `remove` and `toggle` with a flag instead.

- **Types**: `Bitmask<F>`, `RawBitmask`, `Bitflags<F>`, `MaskOf<T>` and
  `BitLayout`.

[Unreleased]: https://github.com/CapnQwan/cult-frog-bitmask-js/commits/main
