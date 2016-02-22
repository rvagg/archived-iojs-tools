'use strict'

const hyperquest = require('hyperquest')
    , bl         = require('bl')
    , map        = require('map-async')
    , ghauth     = require('ghauth')
    , ghusers    = require('ghusers')


    , readme     = 'https://raw.githubusercontent.com/nodejs/node/master/README.md'
    , userapi    = 'https://api.github.com/users/{user}'
    , collabRe   = /^\* \[([^\]]+)\]\(https?:\/\/github\.com\/[^\)]+\) - \*\*([^\*]+)\*\*/


let authData


function fetch (url, callback) {
  hyperquest
    .get(url, { headers: { 'user-agent': 'node.js collaborator table' }})
    .pipe(bl(callback))
}


function fetchAvatar (collaborator, callback) {
  ghusers.get(authData, collaborator.handle, (err, data) => {
    if (err)
      return callback(err)

    collaborator.avatar = data.avatar_url
    callback(null, collaborator)
  })
}


ghauth({ configName: 'collaborator-table' }, (err, _authData) => {
  if (err)
    throw err

  authData = _authData
  compile()
})


function compile () {
  fetch(readme, (err, data) => {
    if (err)
        throw err

    let collaborators = data.toString().match(new RegExp(collabRe.source, 'gm')).map((c) => {
      let m = c.match(collabRe)
      return { handle: m[1], name: m[2] }
    })

    map(collaborators, fetchAvatar, afterMap)

    function afterMap (err, collaborators) {
      if (err)
        throw err

      collaborators = collaborators.reduce((p, c, i) => {
        if (i % 9 === 0) {
          if (i !== 0) {
            p[p.length - 2] += '\n\t</tr>'
            p[p.length - 1] += '\n\t</tr>'
          }
          p.push('\n\t<tr>')
          p.push('\n\t<tr>')
        }
        p[p.length - 2] += `\n\t\t<td><img style="width: 100px; border: solid 3px white;" src="${c.avatar}"></td>`
        p[p.length - 1] += `\n\t\t<td><div style="font-face: 'Source Sans Pro'; background: transparent; text-color: #FCF8FF;">${c.name}</div></td>`
        return p
      }, []).join('\n') + '\n</tr>'

      console.log(`

  <html>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <body>
  <table>
  ${collaborators}
  </table>
  </body>
  </html>

      `)
    }
  })
}
