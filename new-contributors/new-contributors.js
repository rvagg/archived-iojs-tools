#!/usr/bin/env node

'use strict'

const ghauth     = require('ghauth')
    , ghpulls    = require('ghpulls')
    , hyperquest = require('hyperquest')
    , bl         = require('bl')
    , map        = require('map-async')
    , decodeMime = require('mimelib').decodeMimeWord
    , gitexec    = require('gitexec')
    , split2     = require('split2')
    , listStream = require('list-stream')
    , after      = require('after')
    , columnify  = require('columnify')
    , argv       = require('minimist')(process.argv.slice(2))

const defaultDays   = 7
    , defaultOrg    = 'nodejs'
    , defaultRepo   = 'node'
    , days          = Number(argv.days) || Number(argv.d) || defaultDays
    , afterDate     = new Date(Date.now() - 1000 * 60 * 60 * 24 * days)
    , org           = (argv._[0] && argv._[0].split('/')[0]) || defaultOrg
    , repo          = (argv._[0] && argv._[0].split('/')[1]) || defaultRepo
    , authOptions   = { configName: 'iojs-tools' }
    , gitEmailCmd   = `git log --format="%aE" --until='${days} days ago' | sort | uniq`
    , gitDaysAgoCmd = `git log --since="${days} days ago" --format=%H | tail -1`
    , gitMailmapCmd = `git show {{ref}}:.mailmap`
    , dir           = process.cwd()


const done = after(3, onDataComplete)

let gitEmails
  , pullRequests
  , mailmap


gitexec.execCollect(dir, 'git remote -v', (err, remotes) => {
  if (!err && !new RegExp(`github\\.com[/:]${org}/${repo}\.git`).test(remotes))
    console.warn(`WARNING: could not find ${org}/${repo} in the list of remotes for this git repository, perhaps you should supply an 'org/repo' argument?`)
})


gitexec.exec(dir, gitEmailCmd)
  .pipe(split2())
  .pipe(listStream((err, emails) => {
    if (err)
      return done(err)

    emails = emails.map((email) => email.toString())
    gitEmails = emails
    console.log(`Found ${gitEmails.length} email addresses in git log up to ${days} days ago for ${dir}...`)
    done()
  }))


gitexec.execCollect(dir, gitDaysAgoCmd, (err, ref) => {
  if (!ref) {
    console.log(`Could not find a ${dir}/.mailmap from ${days} ago, ignoring...`)
    return done()
  }

  ref = ref.replace(/[\r\n\s]+/g, '')

  gitexec.execCollect(dir, gitMailmapCmd.replace(/\{\{ref\}\}/g, ref), (err, mailmap) => {
    if (err) {
      console.log(`Could not find a ${dir}/.mailmap from ${days} ago, ignoring...`)
      return done()
    }

    console.log(`Loaded ${days} days old ${dir}/.mailmap with ${mailmap.split(/[\n\r]+/).length} entries...`)

    done()
  })
})


getPullRequestData((err, list) => {
  if (err)
    return done(err)

  pullRequests = list
  done()
})


function getPullRequestData (callback) {
  function processList (err, list) {
    if (err)
      throw err

    list = list.filter(Boolean).map((pr) => {
      return {
          name    : pr.from_name
        , email   : pr.from_email
        , contact : `${pr.from_name} <${pr.from_email}>`
        , url     : pr.html_url
        , title   : pr.title
        , number  : `#${pr.number}`
      }
    })

    callback(null, list)
  }

  ghauth(authOptions, (err, authData) => {
    if (err)
      throw err

    ghpulls.list(authData, org, repo, { state: 'all', afterDate }, (err, list) => {
      if (err)
        throw err

      console.log(`Checking ${list.length} pull requests for ${org}/${repo}...`)
      map(list, collectAuthor, processList)
    })
  })
}

function collectAuthor (pull, callback) {
  const url = `https://patch-diff.githubusercontent.com/raw/${org}/${repo}/pull/${pull.number}.patch`

  hyperquest.get(url).pipe(bl((err, data) => {
    if (err)
      return callback(err)

    data = data.toString().replace(/\n\s+/g, ' ')

    const from = data.toString().match(/^From: (.+) <([^>]+)>$/m)
    if (!from)
      return callback()
      //return callback(new Error(`No 'From:' in patch for #${pull.number}`))

    pull.from_name  = from[1].split(/\s/).map((w) => decodeMime(w)).join(' ')
    pull.from_email = from[2]

    callback(null, pull)
  }))
}


function onDataComplete (err) {
  if (err)
    throw err

  pullRequests = pullRequests.filter((pr) => {
    if (mailmap && mailmap.indexOf(`<${pr.email}>`) > -1)
      return false

    if (gitEmails.indexOf(pr.email) > -1)
      return false

    return true
  })

  console.log(`\nNew contributors for the last ${days} day${days == 1 ? '' : 's:'}\n`)
  console.log(columnify(pullRequests, {
    columns: [ 'number', 'contact', 'title', 'url' ]
  }))
}
