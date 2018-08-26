module.exports = function (RED) {
  const exec = require('child_process').exec

  function MemoryNode (conf) {
    RED.nodes.createNode(this, conf)

    this.name = conf.name
    this.totalMemory = (typeof conf.totalMemory === 'undefined') ? true : conf.totalMemory
    this.usedMemory = (typeof conf.usedMemory === 'undefined') ? true : conf.usedMemory

    const node = this

    node.on('input', (msg) => {
      exec('free -mt | grep "Total"', (err, stdout, stderr) => {
        if (err) {
          node.error('child_process exec Error', err.message)
          return false
        }
        const regex = /[0-9]+/g
        const matched = stdout.match(regex)
        let payloadArr = []
        if (this.totalMemory) {
          payloadArr.push({
            payload: matched[0], // total
            topic: 'memory_total_mb'
          })
        }
        if (this.usedMemory) {
          payloadArr.push({
            payload: matched[1], // used
            topic: 'memory_used_mb'
          })
        }
        node.send([ payloadArr ])
      })
    })
  }

  RED.nodes.registerType('memory', MemoryNode)
}
