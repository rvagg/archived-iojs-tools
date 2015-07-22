#!/usr/bin/env node

const spawn          = require('child_process').spawn
    , fs             = require('fs')
    , path           = require('path')
    , commitStream   = require('commit-stream')
    , through2       = require('through2')
    , split2         = require('split2')
    , listStream     = require('list-stream')
    , bl             = require('bl')
    , equal          = require('deep-equal')
    , pkgtoId        = require('pkg-to-id')
    , chalk          = require('chalk')
    , argv           = require('minimist')(process.argv.slice(2))
    , commitToOutput = require('changelog-maker/commit-to-output')

    , pkgFile        = path.join(process.cwd(), 'package.json')
    , pkgData        = fs.existsSync(pkgFile) ? require(pkgFile) : {}
    , pkgId          = pkgtoId(pkgData)
    , branch1        = argv._[0]
    , branch2        = argv._[1]
    , simple         = argv.simple || argv.s
    , ghId           = {
          user: pkgId.user || 'nodejs'
        , name: pkgId.name || 'io.js'
      }


if (!branch1 || !branch2)
  throw new Error('Must supply two branch names to compare')


collect(branch1)
  .pipe(listStream.obj(onBranch1CommitList))


function onBranch1CommitList (err, list) {
  if (err)
    throw err

  console.log(`${list.length} commits on ${branch1}...`)

  collect(branch2)
    .pipe(filterStream(list))
    .pipe(listStream.obj(onBranch2CommitList))
}


function onBranch2CommitList (err, list) {
  if (err)
    throw err

  console.log(`${list.length} commits on ${branch2} that are not on ${branch1}:`)

  list = list.map(function (commit) {
    return commitToOutput(commit, simple, ghId)
  })

  var out = list.join('\n') + '\n'

  if (!process.stdout.isTTY)
    out = chalk.stripColor(out)

  process.stdout.write(out)
}


function filterStream (branch1List) {
  return through2.obj(filter)

  function filter (commit, enc, callback) {
    if (!isInList(commit, branch1List))
      this.push(commit)
    callback()
  }
}


function isInList (commit, commitList) {
  return commitList.some(function (c) {
    if (commit.sha === c.sha)
      return true
    if (commit.summary === c.summary
        && equal(commit.description, c.description)
        && commit.prUrl && c.prUrl
        && commit.prUrl === c.prUrl)
      return true
    return false
  })
}


function collect (branch) {
  var gitcmd = `git log ${branch}`
    , child  = spawn('bash', [ '-c', gitcmd ])

  child.stderr.pipe(bl(function (err, _data) {
    if (err)
      throw err

    if (_data.length)
      process.stderr.write(_data)
  }))

  child.on('close', function (code) {
    if (code)
      throw new Error('git command [' + gitcmd + '] exited with code ' + code)
  })

  return child.stdout.pipe(split2()).pipe(commitStream())
}