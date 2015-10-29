#!/usr/bin/env node

'use strict'

const ghauth   = require('ghauth')
    , ghrepos  = require('ghrepos')
    , ghissues = require('ghissues')
    , map      = require('map-async')

const authOptions = { configName: 'iojs-tools', scopes: [ 'user', 'repo'  ] }
    , repos       = [] // { org: 'joyent', repo: 'node' } ]

if (process.argv.length < 3)
  throw new Error('Please supply a label, e.g. `node-meeting-agenda ctc-agenda')

let label = process.argv[2]


ghauth(authOptions, (err, authData) => {
  if (err)
    throw err

  function fetchIssues (repo, callback) {
    ghissues.list(
        authData
      , repo.org
      , repo.repo
      , { state: 'open', labels: process.argv[2] }
      , callback
    )
  }

  ghrepos.listOrg(authData, 'nodejs', { type: 'public' }, (err, repolist) => {
    if (err)
      throw err

    let ra = repos.concat(repolist.map((r) => ({ org: 'nodejs', repo: r.name })))
    map(ra, fetchIssues, (err, repoLists) => {
      if (err)
        throw err
      printIssues(ra, repoLists)
    })
  })
})


function cleanMarkdown (txt) {
  // just escape '[' & ']'
  return txt.replace(/([\[\]])/g, '\\$1')
}


function printIssues (ra, repoLists) {
  repoLists.forEach(function (list, i) {
    if (!list.length)
      return
    console.log(`### ${ra[i].org}/${ra[i].repo}\n`)

    console.log(list.map((issue) => {
      return `* ${cleanMarkdown(issue.title)} [#${issue.number}](${issue.html_url})`
    }).join('\n') + '\n')
  })
}
