node-red-contrib-linux-memory
===

> collect linux system memory stats

## available values

**basic**
- total
- used
- free

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

### calculation of relative values

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

MIT (c) 2018 - 2019 frncsdrk and contributors
