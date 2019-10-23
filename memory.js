module.exports = function (RED) {
  const exec = require('child_process').exec
  const si = require('systeminformation')

  function toMb (val) {
    return val / 1024 / 1024
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

    this.availableMemory = (typeof conf.availableMemory === 'undefined') ? false : conf.availableMemory
    this.activeMemory = (typeof conf.activeMemory === 'undefined') ? true : conf.activeMemory
    this.buffcacheMemory = (typeof conf.buffcacheMemory === 'undefined') ? true : conf.buffcacheMemory
    this.freeAvailableMemory = (typeof conf.freeAvailableMemory === 'undefined') ? false : conf.freeAvailableMemory

    this.totalMemory = (typeof conf.totalMemory === 'undefined') ? false : conf.totalMemory
    this.usedMemory = (typeof conf.usedMemory === 'undefined') ? false : conf.usedMemory
    this.freeMemory = (typeof conf.freeMemory === 'undefined') ? false : conf.freeMemory

    this.swapTotalMemory = (typeof conf.swapTotalMemory === 'undefined') ? false : conf.swapTotalMemory
    this.swapUsedMemory = (typeof conf.swapUsedMemory === 'undefined') ? false : conf.swapUsedMemory
    this.swapFreeMemory = (typeof conf.swapFreeMemory === 'undefined') ? false : conf.swapFreeMemory

    const node = this

    node.on('input', (msg) => {
      si.mem()
        .then(data => {
          let payloadArr = []
          if (!this.relativeValues) {
            payloadArr = this.calculatePayloadsAbsolute(data, payloadArr)
          }
          else {
            payloadArr = this.calculatePayloadsRelative(data, payloadArr)
          }
          node.send([ payloadArr ])
        })
        .catch(err => {
          node.error('SI mem Error', err.message)
        })
    })
  }

  MemoryNode.prototype.calculatePayloadsAbsolute = function (data, payloadArr) {
    const possiblePayloads = [
      { // available memory
        condition: this.availableMemory,
        result: {
          payload: toMb(data.available), // available
          topic: 'memory_available_mb'
        }
      },
      { // active memory
        condition: this.activeMemory,
        result: {
          payload: toMb(data.active), // active
          topic: 'memory_active_mb'
        }
      },
      { // buffcache memory
        condition: this.buffcacheMemory,
        result: {
          payload: toMb(data.buffcache), // buffcache
          topic: 'memory_buffcache_mb'
        }
      },
      { // free available memory
        condition: this.freeAvailableMemory,
        result: {
          payload: toMb(data.available - data.active), // free available (excl. buffer / cache)
          topic: 'memory_free_available_mb'
        }
      },
      { // total memory
        condition: this.totalMemory,
        result: {
          payload: toMb(data.total), // total
          topic: 'memory_total_mb'
        }
      },
      { // used memory
        condition: this.usedMemory,
        result: {
          payload: toMb(data.used), // used
          topic: 'memory_used_mb'
        }
      },
      { // free memory
        condition: this.freeMemory,
        result: {
          payload: toMb(data.free), // free
          topic: 'memory_free_mb'
        }
      },
      { // swap total memory
        condition: this.swapTotalMemory,
        result: {
          payload: toMb(data.swaptotal), // swap total
          topic: 'memory_swap_total_mb'
        }
      },
      { // swap used memory
        condition: this.swapUsedMemory,
        result: {
          payload: toMb(data.swapused), // swap used
          topic: 'memory_swap_used_mb'
        }
      },
      { // swap free memory
        condition: this.swapFreeMemory,
        result: {
          payload: toMb(data.swapfree), // swap free
          topic: 'memory_swap_free_mb'
        }
      }
    ]

    return aggregatePayloads(possiblePayloads, payloadArr)
  }

  MemoryNode.prototype.calculatePayloadsRelative = function (data, payloadArr) {
    const possiblePayloads = [
      { // available memory
        condition: this.availableMemory,
        result: {
          payload: toMb(data.available) / (toMb(data.total) / 100), // available
          topic: 'memory_available_per_cent'
        }
      },
      { // active memory
        condition: this.activeMemory,
        result: {
          payload: toMb(data.active) / (toMb(data.available) / 100), // active
          topic: 'memory_active_per_cent'
        }
      },
      { // buffcache memory
        condition: this.buffcacheMemory,
        result: {
          payload: toMb(data.buffcache) / (toMb(data.available) / 100), // buffcache
          topic: 'memory_buffcache_per_cent'
        }
      },
      { // free available memory
        condition: this.freeAvailableMemory,
        result: {
          payload: toMb(data.available - data.active) / (toMb(data.available) / 100), // free available (excl. buffer / cache)
          topic: 'memory_free_available_per_cent'
        }
      },
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
          payload: toMb(data.used) / (toMb(data.total) / 100), // used
          topic: 'memory_used_per_cent'
        }
      },
      { // free memory
        condition: this.freeMemory,
        result: {
          payload: toMb(data.free) / (toMb(data.total) / 100), // free
          topic: 'memory_free_per_cent'
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
          payload: toMb(data.swapused) / (toMb(data.swaptotal) / 100), // swap used
          topic: 'memory_swap_used_per_cent'
        }
      },
      { // swap free memory
        condition: this.swapFreeMemory,
        result: {
          payload: toMb(data.swapfree) / (toMb(data.swaptotal) / 100), // swap free
          topic: 'memory_swap_free_per_cent'
        }
      }
    ]

    return aggregatePayloads(possiblePayloads, payloadArr)
  }

  RED.nodes.registerType('memory', MemoryNode)
}
