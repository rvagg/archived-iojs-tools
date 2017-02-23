#!/usr/bin/env node

'use strict'

const path          = require('path')
    , fs            = require('fs')

    , ghauth        = require('ghauth')
    , ghpulls       = require('ghpulls')
    , ghissues      = require('ghissues')
    , pkgToId       = require('pkg-to-id')
    , after         = require('after')
    , hyperquest    = require('hyperquest')
    , bl            = require('bl')

    , argv          = require('minimist')(process.argv.slice(2))

    , listRemotes   = require('./list-remotes')
    , currentBranch = require('./current-branch')

    , pkgFile       = path.join(process.cwd(), 'package.json')
    , pkgData       = fs.existsSync(pkgFile) ? require(pkgFile) : {}
    , pkgId         = pkgToId(pkgData)


    , collabRe      = '^\\* \\[([^\\]]+)\\]\\([^\\)]+\\) -\n\\*\\*([^\\*]+)\\*\\* &lt;([^&]+)&gt;( \(.+\))?$'
    /* e.g.
* [Trott](https://github.com/Trott) -
**Rich Trott** &lt;rtrott@gmail.com&gt; (he/him)
    */
    , lgtmRe        = /(\W|^)lgtm(\W|$)/i

    , ghUser        = pkgId.user || 'nodejs'
    , ghRepo        = pkgId.name || 'node'

    , authOptions   = {
          configName : 'pr-metadata'
        , scopes     : [ ]
      }


function githubHeads (user, callback) {
  let remotes, branch
    , done = after(2, afterFinish)

  function afterFinish (err) {
    if (err)
      return callback(err)

    let heads = remotes.map((r) => `${r.user}/${r.repo}:${branch}`)
    callback(null, heads)
  }

  currentBranch((err, _branch) => {
    if (err)
      return done(err)

    branch = _branch
    done()
  })


  listRemotes((err, _remotes) => {
    if (err)
      return done(err)

    remotes = _remotes.filter((r) => r.user == user)

    if (remotes.length === 0)
      return done(new Error('Could not determine which remote is yours'))

    done()
  })
}


function listPulls (authData, heads, callback) {
  let pulls = []
    , done  = after(heads.length, afterFinish)

  function afterFinish (err) {
    if (err)
      return callback(err)

    callback(null, pulls)
  }

  heads.forEach((head) => {
    ghpulls.list(authData, ghUser, ghRepo, { head: head }, (err, list) => {
      if (err)
        return done(err)

      pulls = pulls.concat(list)
      done()
    })
  })
}


function listCollaborators (callback) {
  hyperquest.get('https://raw.githubusercontent.com/nodejs/node/master/README.md')
    .pipe(bl((err, body) => {
      if (err)
        return callback(err)

      let collaborators = body.toString().match(new RegExp(collabRe, 'mg'))

      if (!collaborators)
        return callback(new Error('Could not list collaborators from Node.js README'))

      collaborators = collaborators.reduce((p, c) => {
        let m = c.match(new RegExp(collabRe))
        p[m[1].toLowerCase()] = {
            login : m[1]
          , name  : m[2]
          , email : m[3]
        }
        return p
      }, {})

      if (!Object.keys(collaborators).length)
        return callback(new Error('Could not list collaborators from Node.js README'))

      callback(null, collaborators)
    }))
}


function prTransform (pr) {
  return { number: pr.number, title: pr.title, login: pr.user.login, url: pr.html_url }
}


function processPr (pr) {
  ghauth(authOptions, (err, authData) => {
    if (err)
      throw err

    if (typeof pr == 'object')
      return processFullPr(pr)

    ghissues.get(authData, ghUser, ghRepo, pr, (err, pr) => {
      if (err)
        throw err

      processFullPr(prTransform(pr))
    })

    function processFullPr (pr) {
      let comments = []
        , reviews
        , collaborators
        , done = after(4, afterComments)

      ;[ ghissues, ghpulls ].forEach((api) => {
        api.listComments(authData, ghUser, ghRepo, pr.number, (err, commentlist) => {
          if (err)
            return done(err)

          comments = comments.concat(commentlist.filter((c) => lgtmRe.test(c.body)))

          done()
        })
      })

      ghpulls.listReviews(authData, ghUser, ghRepo, pr.number, (err, reviews) => {
        if (err)
          return done(err)

        comments = comments.concat(reviews.filter((r) => r.state == 'APPROVED'))
        done()
      })

      listCollaborators((err, _collaborators) => {
        if (err)
          return done(err)

        collaborators = _collaborators

        done()
      })


      function afterComments (err) {
        if (err)
          throw err

        console.log(`PR-URL: ${pr.url}`)

        let revby = []
        comments.forEach((c) => {
          let user = collaborators[c.user.login.toLowerCase()]
          if (user)
            user = `${user.name} <${user.email}>`
          else
            user = c.user.login

          let txt = `Reviewed-By: ${user}`
          if (revby.indexOf(txt) < 0)
            revby.push(txt)
        })

        console.log(revby.join('\n'))
      }
    }
  })
}


// provided a PR number as first arg
if (argv._[0] && argv._[0] + 0 > 0)
  return processPr(argv._[0])


// provided a full PR url
let m = typeof argv._[0] == 'string' && argv._[0].match(new RegExp(`^https:\\/\\/github\\.com\\/${ghUser}\\/${ghRepo}\\/pull\\/(\\d+)`))
if (m)
  return processPr(m[1])

ghauth(authOptions, (err, authData) => {
  if (err)
    throw err

  githubHeads(authData.user, (err, heads) => {
    if (err)
      throw err

    listPulls(authData, heads, (err, list) => {
      if (err)
        throw err

      list = list.map(prTransform)

      if (list.length === 0)
        throw new Error('Could not determine which pull request uses this branch')

      if (list.length > 1)
        throw new Error('Found more than one satisfying pull request, this is most puzzling and ought not happen')

      let pr = list[0]

      if (pr.login.toLowerCase() != authData.user.toLowerCase())
        throw new Error('Found a pull request for this branch not owned by you, most vexing and I\'d rather not continue')

      processPr(pr)
    })
  })
})
