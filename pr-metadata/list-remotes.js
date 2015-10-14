'use strict'

const spawn = require('child_process').spawn

    , bl    = require('bl')
    , once  = require('once')


function listRemotes (callback) {
  callback = once(callback)

  let child = spawn('bash', [ '-c', 'git remote -v' ])

  child.stdout.pipe(bl((err, _data) => {
    if (err)
      return callback(err)

    let uniques = []

    _data.toString().split(/[\n\r]+/)
      .map((l) => {
        let m = l.match(/\s(?:https:\/\/|git@)github\.com[\/:]([^\/]+)\/([^\s]+)\s\(push\)/)
        if (m)
          return { user: m[1], repo: m[2].replace(/\.git$/, '') }
      })
      .filter(Boolean)
      .forEach((r) => {
        if (!uniques.some((u) => u.user == r.user && u.repo == r.repo))
          uniques.push(r)
      })

    callback(null, uniques)
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


module.exports = listRemotes