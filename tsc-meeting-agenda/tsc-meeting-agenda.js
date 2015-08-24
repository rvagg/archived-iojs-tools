const ghauth   = require('ghauth')
    , ghissues = require('ghissues')
    , map      = require('map-async')

const authOptions = { configName: 'iojs-tools' }
    , repos       = [
        , { org: 'nodejs', repo: 'node' }
        , { org: 'joyent', repo: 'node'  }
      ]


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

  map(repos, fetchIssues, printIssues)
})


function cleanMarkdown (txt) {
  // just escape '[' & ']'
  return txt.replace(/([\[\]])/g, '\\$1')
}


function printIssues (err, repoLists) {
  if (err)
    throw err

  repoLists.forEach(function (list, i) {
    console.log(`### ${repos[i].org}/${repos[i].repo}\n`)

    console.log(list.map(function (issue) {
      return `* ${cleanMarkdown(issue.title)} [#${issue.number}](${issue.html_url})`
    }).join('\n') + '\n')
  })
}
