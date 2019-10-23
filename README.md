node-red-contrib-linux-memory
===

> collect linux system memory stats

## available values

**excl. buffer / cache**
- available
- active
- buffer + cache
- free available

**incl. buffer / cache**
- total
- used
- free

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
