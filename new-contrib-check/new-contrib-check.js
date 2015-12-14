const ghauth     = require('ghauth')
    , ghpulls    = require('ghpulls')
    , hyperquest = require('hyperquest')
    , bl         = require('bl')
    , map        = require('map-async')
    , decodeMime = require('mimelib').decodeMimeWord
    , spawn      = require('child_process').spawn
    , split2     = require('split2')
    , listStream = require('list-stream')
    , once       = require('once')
    , fs         = require('fs')
    , after      = require('after')
    , columnify  = require('columnify')


const authOptions = { configName: 'iojs-tools' }
    , gitEmailCmd = 'git log --format="%aE" | sort | uniq'
    , afterDate   = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)


var done = after(3, onDataComplete)
  , gitEmails
  , pullRequests
  , mailmap


gitEmailList((err, emails) => {
  if (err)
    return done(err)

  emails = emails.map((email) => email.toString())
  gitEmails = emails
  done()
})


fs.readFile('./.mailmap', 'utf8', (err, data) => {
  if (err)
    return done(err)

  mailmap = data
  done()
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

    ghpulls.list(authData, 'nodejs', 'node', { state: 'all', afterDate }, (err, list) => {
      if (err)
        throw err

      map(list, collectAuthor, processList)
    })
  })
}

function collectAuthor (pull, callback) {
  var url = `https://patch-diff.githubusercontent.com/raw/nodejs/node/pull/${pull.number}.patch`

  hyperquest.get(url).pipe(bl((err, data) => {
    if (err)
      return callback(err)

    data = data.toString().replace(/\n\s+/g, ' ')

    var from = data.toString().match(/^From: (.+) <([^>]+)>$/m)
    if (!from)
      return callback()
      //return callback(new Error(`No 'From:' in patch for #${pull.number}`))

    pull.from_name  = from[1].split(/\s/).map((w) => decodeMime(w)).join(' ')
    pull.from_email = from[2]

    callback(null, pull)
  }))
}


function gitEmailList (callback) {
  callback = once(callback)

  var child = spawn('bash', [ '-c', gitEmailCmd ])

  child.stdout.pipe(split2()).pipe(listStream(callback))

  child.stderr.pipe(bl((err, _data) => {
    if (_data.length)
      process.stderr.write(_data)

    if (err)
      callback(err)
  }))

  child.on('close', (code) => {
    if (code) {
      callback(new Error(`git command [${gitEmailCmd}] exited with code ${code}`))
      console.error(`git command [${gitEmailCmd}] exited with code ${code}`)
    }
  })
}


function onDataComplete (err) {
  if (err)
    throw err

  pullRequests = pullRequests.filter((pr) => {
    if (mailmap.indexOf(`<${pr.email}>`) > -1)
      return false

    if (gitEmails.indexOf(pr.email) > -1)
      return false

    return true
  })

  console.log(columnify(pullRequests, {
    columns: [ 'number', 'contact', 'title', 'url' ]
  }))
}
