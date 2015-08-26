const ghauth   = require('ghauth')
    , ghrepos  = require('ghrepos')
    , ghissues = require('ghissues')
    , map      = require('map-async')

const authOptions = { configName: 'iojs-tools', scopes: [ 'user', 'repo'  ] }
    , repos       = [ { org: 'joyent', repo: 'node' } ]


ghauth(authOptions, function (err, authData) {
  if (err)
    throw err

  function fetchIssues (repo, callback) {
    ghissues.list(
        authData
      , repo.org
      , repo.repo
      , { state: 'open', labels: 'tsc-agenda' }
      , callback
    )
  }

  ghrepos.listOrg(authData, 'nodejs', { type: 'public' }, function (err, repolist) {
    if (err)
      throw err

    var ra = repos.concat(repolist.map(function (r) { return { org: 'nodejs', repo: r.name } }))
    map(ra, fetchIssues, function (err, repoLists) {
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

    console.log(list.map(function (issue) {
      return `* ${cleanMarkdown(issue.title)} [#${issue.number}](${issue.html_url})`
    }).join('\n') + '\n')
  })
}
