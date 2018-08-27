module.exports = function (RED) {
  const exec = require('child_process').exec
  const si = require('systeminformation')

  function MemoryNode (conf) {
    RED.nodes.createNode(this, conf)

    console.log('conf:', conf)

    this.name = conf.name
    this.absolute = (typeof conf.absolute === 'undefined') ? true : conf.absolute
    this.relative = (typeof conf.relative === 'undefined') ? false : conf.relative
    this.totalMemory = (typeof conf.totalMemory === 'undefined') ? false : conf.totalMemory
    this.usedMemory = (typeof conf.usedMemory === 'undefined') ? true : conf.usedMemory
    this.freeMemory = (typeof conf.freeMemory === 'undefined') ? false : conf.freeMemory

    console.log('absoluteValue, relativeValues:', this.absolute.toString(), this.relative.toString())

    const node = this

    node.on('input', (msg) => {
      si.mem()
        .then(data => {
          let payloadArr = []
          if (this.totalMemory) {
            payloadArr.push({
              payload: data.total / 1024 / 1024, // total
              topic: 'memory_total_mb'
            })
          }
          if (this.usedMemory) {
            payloadArr.push({
              payload: data.used / 1024 / 1024, // used
              topic: 'memory_used_mb'
            })
          }
          if (this.freeMemory) {
            payloadArr.push({
              payload: data.free / 1024 / 1024, // free
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
