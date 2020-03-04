# node-red-contrib-linux-memory

> Collect linux system memory stats

## Configuration

### General

- Name
- Relative values flag
- Unit type

### Available values

**basic**
- total
- used
- free
- buffers
- cached
- slab

**advanced**
- available (= total - active)
- active (used actively excl. buffer/cache)
- used by buffer + cache

**special**
- free available (= available - active)

**swap**
- total
- used
- free

### Calculation of relative values

Relative values are from the amount of total system memory. The swap values are calculated independently of the memory.

One can decide if to use absolute or relative values.

## Copyright info

Linux is a registered trademark of Linus Torvalds.

## Contributions

see `CONTRIBUTING`

## Dependencies

[systeminformation](https://github.com/sebhildebrandt/systeminformation)

## Credits

see `CREDITS` file

## License

MIT (c) 2018 - 2020 frncsdrk and contributors
