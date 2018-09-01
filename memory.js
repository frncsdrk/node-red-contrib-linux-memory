module.exports = function (RED) {
  const exec = require('child_process').exec
  const si = require('systeminformation')

  function toMb (val) {
    return val / 1024 / 1024
  }

  function MemoryNode (conf) {
    RED.nodes.createNode(this, conf)

    this.name = conf.name
    this.relativeValues = (typeof conf.relativeValues === 'undefined') ? false : conf.relativeValues
    this.availableMemory = (typeof conf.availableMemory === 'undefined') ? false : conf.availableMemory
    this.activeMemory = (typeof conf.activeMemory === 'undefined') ? true : conf.activeMemory
    this.freeAvailableMemory = (typeof conf.freeAvailableMemory === 'undefined') ? false : conf.freeAvailableMemory

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
    if (this.availableMemory) {
      payloadArr.push({
        payload: toMb(data.available), // total
        topic: 'memory_available_mb'
      })
    }
    if (this.activeMemory) {
      payloadArr.push({
        payload: toMb(data.active), // used
        topic: 'memory_active_mb'
      })
    }
    if (this.freeAvailableMemory) {
      payloadArr.push({
        payload: toMb(data.available - data.active), // free
        topic: 'memory_free_available_mb'
      })
    }

    return payloadArr
  }

  MemoryNode.prototype.calculatePayloadsRelative = function (data, payloadArr) {
    if (this.availableMemory) {
      payloadArr.push({
        payload: 100, // total
        topic: 'memory_available_per_cent'
      })
    }
    if (this.activeMemory) {
      payloadArr.push({
        payload: toMb(data.active) / (toMb(data.available) / 100), // active
        topic: 'memory_active_per_cent'
      })
    }
    if (this.freeAvailableMemory) {
      payloadArr.push({
        payload: toMb(data.available - data.active) / (toMb(data.available) / 100), // free excl. buffer / cache
        topic: 'memory_active_free_per_cent'
      })
    }

    return payloadArr
  }

  RED.nodes.registerType('memory', MemoryNode)
}
