#!/usr/bin/env node

const ghrepos    = require('ghrepos')
    , ghauth     = require('ghauth')
    , semver     = require('semver')
    , hyperquest = require('hyperquest')
    , bl         = require('bl')
    , argv       = require('minimist')(process.argv.slice(2))
    , inspect    = require('util').inspect


ghauth({ configName: 'v8-changelog', scopes: [ ] }, function (err, auth) {
  if (err)
    throw err

  ghrepos.listBranches(auth, 'v8', 'v8-git-mirror', function (err, list) {
    if (err)
      throw err

    var top = null
    list.forEach(function (b) {
      if (!(/\d+\.\d+\.\d+/.test(b.name)))
        return

      if (top == null || semver.gt(b.name, top.name))
        top = b
    })


    hyperquest
      .get(`https://raw.githubusercontent.com/v8/v8-git-mirror/${top.commit.sha}/ChangeLog`)
      .pipe(bl(function (err, data) {
        if (err)
          throw err

        processPage(data.toString())        
      }))
  })
})


function processPage(page) {
  var verre   = /^(\d{4}-\d\d-\d\d): Version ([\d\.]+)$/
    , cl      = []
    , br

  page.split('\n').forEach(function (line) {
    var match = line.match(verre)
    if (match) {
      cl.push({ date: match[1], version: match[2], changes: [] })
      br = false
      return
    }

    if (/^\s*$/.test(line)) {
      br = true
      return
    }

    if (argv.trim && line.indexOf('Performance and stability improvements on all platforms.') > -1) {
      br = false
      return
    }

    var cur = cl[cl.length - 1]
    line = line.replace(/^\s+/g, '') + '\n'

    if (!br && cur.changes.length)
      cur.changes[cur.changes.length - 1] += line
    else
      cur.changes.push(line)

    br = false
  })

  if (argv.range) {
    cl = cl.filter(function (v) {
      var version = v.version.match(/(\d+\.\d+\.\d+)/)[1]
      return semver.satisfies(version, argv.range)
    })
  }

  print(cl)
}


function print (cl) {
  cl.filter(function (v, i) {
    return !argv.trim || i === 0 || v.changes.length
  }).forEach(function (cl, i, a) {
    console.log(`## ${cl.version} (${cl.date})`)

    if (cl.changes.length) {
      console.log('\n' + cl.changes.map(function (change) {
        return `  * ${change.replace(/\n/g, '\n    ').replace(/\s+$/m, '')}`
      }).join('\n'))
    }

    if (i != a.length - 1)
      console.log()
  })
}