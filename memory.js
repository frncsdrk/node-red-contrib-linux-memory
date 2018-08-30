module.exports = function (RED) {
  const exec = require('child_process').exec
  const si = require('systeminformation')

  function toMb (val) {
    return val / 1024 / 1024
  }

  function MemoryNode (conf) {
    RED.nodes.createNode(this, conf)

    console.log('conf:', conf)

    this.name = conf.name
    this.relativeValues = (typeof conf.relativeValues === 'undefined') ? false : conf.relativeValues
    this.totalMemory = (typeof conf.totalMemory === 'undefined') ? false : conf.totalMemory
    this.usedMemory = (typeof conf.usedMemory === 'undefined') ? true : conf.usedMemory
    this.freeMemory = (typeof conf.freeMemory === 'undefined') ? false : conf.freeMemory

    console.log('relativeValues:', this.relativeValues)

    const node = this

    node.on('input', (msg) => {
      si.mem()
        .then(data => {
          let payloadArr = []
          if (this.totalMemory) {
            payloadArr.push({
              payload: toMb(data.total), // total
              topic: 'memory_total_mb'
            })
          }
          if (this.usedMemory) {
            payloadArr.push({
              payload: toMb(data.used), // used
              topic: 'memory_used_mb'
            })
          }
          if (this.freeMemory) {
            payloadArr.push({
              payload: toMb(data.free), // free
              topic: 'memory_free_mb'
            })
          }
          node.send([ payloadArr ])
        })
        .catch(err => {
          node.error('SI mem Error', err.message)
        })
    })
  }

  RED.nodes.registerType('memory', MemoryNode)
}
