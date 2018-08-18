module.exports = function (RED) {
  const exec = require('child_process').exec

  function MemoryNode (conf) {
    RED.nodes.createNode(this, conf)

    this.name = conf.name

    const node = this

    node.on('input', (msg) => {      
      exec('free -mt | grep "Total"', (err, stdout, stderr) => {
        if (err) {
          node.error('Error', err.message)
          return false
        }
        const regex = /[0-9]+/g
        const matched = stdout.match(regex)
        node.send({
          payload: matched[1], // free
          topic: 'memory_used_mb'
        })
      })
    })
  }

  RED.nodes.registerType('memory', MemoryNode)
}
