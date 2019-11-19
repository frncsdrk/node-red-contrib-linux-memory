module.exports = function (RED) {
  // const exec = require('child_process').exec
  const si = require('systeminformation')

  function toKb (val) {
    return val / 1024
  }

  function toMb (val) {
    return val / 1024 / 1024
  }

  function toGb (val) {
    return val / 1024 / 1024 / 1024
  }

  function convertToUnit(unitType, val) {
    let result
    switch (unitType) {
      case 'kb':
        result = toKb(val)
        break
      case 'gb':
        result = toGb(val)
        break
      // display as mb by default
      default:
        result = toMb(val)
        break
    }

    return result
  }

  function aggregatePayloads (possiblePayloads, payloadArr) {
    for (let i = 0; i < possiblePayloads.length; i++) {
      const possiblePayloadsItem = possiblePayloads[i]
      if (possiblePayloadsItem.condition) {
        payloadArr.push(possiblePayloadsItem.result)
      }
    }

    return payloadArr
  }

  function MemoryNode (conf) {
    RED.nodes.createNode(this, conf)

    this.name = conf.name
    this.relativeValues = (typeof conf.relativeValues === 'undefined') ? false : conf.relativeValues
    this.unitType = conf.unitType

    this.totalMemory = (typeof conf.totalMemory === 'undefined') ? false : conf.totalMemory
    this.usedMemory = (typeof conf.usedMemory === 'undefined') ? false : conf.usedMemory
    this.freeMemory = (typeof conf.freeMemory === 'undefined') ? false : conf.freeMemory

    this.buffersMemory = (typeof conf.buffersMemory === 'undefined') ? false : conf.buffersMemory
    this.cachedMemory = (typeof conf.cachedMemory === 'undefined') ? false : conf.cachedMemory
    this.slabMemory = (typeof conf.slabMemory === 'undefined') ? false : conf.slabMemory

    this.availableMemory = (typeof conf.availableMemory === 'undefined') ? false : conf.availableMemory
    this.activeMemory = (typeof conf.activeMemory === 'undefined') ? true : conf.activeMemory
    this.buffcacheMemory = (typeof conf.buffcacheMemory === 'undefined') ? true : conf.buffcacheMemory
    this.freeAvailableMemory = (typeof conf.freeAvailableMemory === 'undefined') ? false : conf.freeAvailableMemory

    this.swapTotalMemory = (typeof conf.swapTotalMemory === 'undefined') ? false : conf.swapTotalMemory
    this.swapUsedMemory = (typeof conf.swapUsedMemory === 'undefined') ? false : conf.swapUsedMemory
    this.swapFreeMemory = (typeof conf.swapFreeMemory === 'undefined') ? false : conf.swapFreeMemory

    const node = this

    node.on('input', (msg, send, done) => {
      send = send || function() { node.send.apply(node, arguments) }
      si.mem()
        .then(data => {
          let payloadArr = []
          if (!this.relativeValues) {
            payloadArr = this.calculatePayloadsAbsolute(data, payloadArr)
          }
          else {
            payloadArr = this.calculatePayloadsRelative(data, payloadArr)
          }
          send([ payloadArr ])
          if (done) {
            done()
          }
        })
        .catch(err => {
          if (done) {
            done(err.message)
          } else {
            node.error('SI mem Error', err.message)
          }
        })
    })
  }

  MemoryNode.prototype.calculatePayloadsAbsolute = function (data, payloadArr) {
    const possiblePayloads = [
      { // total memory
        condition: this.totalMemory,
        result: {
          payload: convertToUnit(this.unitType, data.total), // total
          topic: 'memory_total'
        }
      },
      { // used memory
        condition: this.usedMemory,
        result: {
          payload: convertToUnit(this.unitType, data.used), // used
          topic: 'memory_used'
        }
      },
      { // free memory
        condition: this.freeMemory,
        result: {
          payload: convertToUnit(this.unitType, data.free), // free
          topic: 'memory_free'
        }
      },
      { // buffers memory
        condition: this.buffersMemory,
        result: {
          payload: convertToUnit(this.unitType, data.buffers), // buffers
          topic: 'memory_buffers'
        }
      },
      { // cached memory
        condition: this.cachedMemory,
        result: {
          payload: convertToUnit(this.unitType, data.cached), // cached
          topic: 'memory_cached'
        }
      },
      { // slab memory
        condition: this.slabMemory,
        result: {
          payload: convertToUnit(this.unitType, data.slab), // slab
          topic: 'memory_slab'
        }
      },
      { // available memory
        condition: this.availableMemory,
        result: {
          payload: convertToUnit(this.unitType, data.available), // available
          topic: 'memory_available'
        }
      },
      { // active memory
        condition: this.activeMemory,
        result: {
          payload: convertToUnit(this.unitType, data.active), // active
          topic: 'memory_active'
        }
      },
      { // buffcache memory
        condition: this.buffcacheMemory,
        result: {
          payload: convertToUnit(this.unitType, data.buffcache), // buffcache
          topic: 'memory_buffcache'
        }
      },
      { // free available memory
        condition: this.freeAvailableMemory,
        result: {
          payload: convertToUnit(this.unitType, data.available - data.active), // free available (excl. buffer / cache)
          topic: 'memory_free_available'
        }
      },
      { // swap total memory
        condition: this.swapTotalMemory,
        result: {
          payload: convertToUnit(this.unitType, data.swaptotal), // swap total
          topic: 'memory_swap_total'
        }
      },
      { // swap used memory
        condition: this.swapUsedMemory,
        result: {
          payload: convertToUnit(this.unitType, data.swapused), // swap used
          topic: 'memory_swap_used'
        }
      },
      { // swap free memory
        condition: this.swapFreeMemory,
        result: {
          payload: convertToUnit(this.unitType, data.swapfree), // swap free
          topic: 'memory_swap_free'
        }
      }
    ]

    return aggregatePayloads(possiblePayloads, payloadArr)
  }

  MemoryNode.prototype.calculatePayloadsRelative = function (data, payloadArr) {
    const possiblePayloads = [
      { // total memory
        condition: this.totalMemory,
        result: {
          payload: 100, // total
          topic: 'memory_total_per_cent'
        }
      },
      { // used memory
        condition: this.usedMemory,
        result: {
          payload: convertToUnit(this.unitType, data.used) / (convertToUnit(this.unitType, data.total) / 100), // used
          topic: 'memory_used_per_cent'
        }
      },
      { // free memory
        condition: this.freeMemory,
        result: {
          payload: convertToUnit(this.unitType, data.free) / (convertToUnit(this.unitType, data.total) / 100), // free
          topic: 'memory_free_per_cent'
        }
      },
      { // buffers memory
        condition: this.buffersMemory,
        result: {
          payload: convertToUnit(this.unitType, data.buffers) / (convertToUnit(this.unitType, data.total) / 100), // buffers
          topic: 'memory_buffers_per_cent'
        }
      },
      { // cached memory
        condition: this.cachedMemory,
        result: {
          payload: convertToUnit(this.unitType, data.cached) / (convertToUnit(this.unitType, data.total) / 100), // cached
          topic: 'memory_cached_per_cent'
        }
      },
      { // slab memory
        condition: this.slabMemory,
        result: {
          payload: convertToUnit(this.unitType, data.slab) / (convertToUnit(this.unitType, data.total) / 100), // slab
          topic: 'memory_slab_per_cent'
        }
      },
      { // available memory
        condition: this.availableMemory,
        result: {
          payload: convertToUnit(this.unitType, data.available) / (convertToUnit(this.unitType, data.total) / 100), // available
          topic: 'memory_available_per_cent'
        }
      },
      { // active memory
        condition: this.activeMemory,
        result: {
          payload: convertToUnit(this.unitType, data.active) / (convertToUnit(this.unitType, data.available) / 100), // active
          topic: 'memory_active_per_cent'
        }
      },
      { // buffcache memory
        condition: this.buffcacheMemory,
        result: {
          payload: convertToUnit(this.unitType, data.buffcache) / (convertToUnit(this.unitType, data.available) / 100), // buffcache
          topic: 'memory_buffcache_per_cent'
        }
      },
      { // free available memory
        condition: this.freeAvailableMemory,
        result: {
          payload: convertToUnit(this.unitType, data.available - data.active) / (convertToUnit(this.unitType, data.available) / 100), // free available (excl. buffer / cache)
          topic: 'memory_free_available_per_cent'
        }
      },
      { // swap total memory
        condition: this.swapTotalMemory,
        result: {
          payload: 100, // swap total
          topic: 'memory_swap_total_per_cent'
        }
      },
      { // swap used memory
        condition: this.swapUsedMemory,
        result: {
          payload: convertToUnit(this.unitType, data.swapused) / (convertToUnit(this.unitType, data.swaptotal) / 100), // swap used
          topic: 'memory_swap_used_per_cent'
        }
      },
      { // swap free memory
        condition: this.swapFreeMemory,
        result: {
          payload: convertToUnit(this.unitType, data.swapfree) / (convertToUnit(this.unitType, data.swaptotal) / 100), // swap free
          topic: 'memory_swap_free_per_cent'
        }
      }
    ]

    return aggregatePayloads(possiblePayloads, payloadArr)
  }

  RED.nodes.registerType('memory', MemoryNode)
}
