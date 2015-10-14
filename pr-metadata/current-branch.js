'use strict'

const spawn = require('child_process').spawn

    , bl    = require('bl')
    , once  = require('once')


function currentBranch (callback) {
  callback = once(callback)

  let child = spawn('bash', [ '-c', 'git rev-parse --abbrev-ref HEAD' ])

  child.stdout.pipe(bl((err, _data) => {
    if (err)
      return callback(err)

    callback(null, _data.toString().replace(/[\s\n\r]+/g, ''))
  }))

  child.stderr.pipe(bl((err, _data) => {
    if (err)
      return callback(err)

    if (_data.length)
      process.stderr.write(_data)
  }))

  child.on('close', (code) => {
    if (code)
      return callback(new Error('git command [' + gitcmd + '] exited with code ' + code))
  })
}


module.exports = currentBranch
