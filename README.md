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
- active (excl. buffer/cache)
- buffer + cache

**special**
- free available (available - active)

**swap**
- total
- used
- free

### calculation of relative values

Relative values are from the amount of total system memory. The swap values are calculated indepndently of the memory.

One can decide if to use absolute or relative values.

## Copyright info

Linux is a registered trademark of Linus Torvalds.


## Credits

[systeminformation](https://github.com/sebhildebrandt/systeminformation)
