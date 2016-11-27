'use strict'

const hyperquest = require('hyperquest')
    , bl         = require('bl')
    , map        = require('map-async')
    , ghauth     = require('ghauth')
    , ghusers    = require('ghusers')
    , fs         = require('fs')
    , path       = require('path')


    , columns    = 12
    , readme     = 'https://raw.githubusercontent.com/nodejs/node/master/README.md'
    , userapi    = 'https://api.github.com/users/{user}'
    , collabRe   = /^\* \[([^\]]+)\]\(https?:\/\/github\.com\/[^\)]+\) -\n\*\*([^\*]+)\*\*/m
    , avatarCacheFile = path.join(__dirname, '.avatar_cache')


let authData
  , avatarCache = {}

try {
  avatarCache = JSON.parse(fs.readFileSync(avatarCacheFile, 'utf8'))
} catch (e) {}

ghauth({ configName: 'collaborator-table' }, (err, _authData) => {
  if (err)
    throw err

  authData = _authData
  compile()
})


function fetch (url, callback) {
  hyperquest
    .get(url, { headers: { 'user-agent': 'node.js collaborator table' }})
    .pipe(bl(callback))
}


function fetchAvatar (collaborator, callback) {
  function ret (avatar) {
    collaborator.avatar = avatar
    avatarCache[collaborator.handle] = avatar
    callback(null, collaborator)
  }

  if (avatarCache[collaborator.handle])
    return ret(avatarCache[collaborator.handle])

  ghusers.get(authData, collaborator.handle, (err, data) => {
    if (err)
      return callback(err)
    ret(data.avatar_url)
  })
}


function compile () {
  fetch(readme, (err, data) => {
    if (err)
        throw err

    let collabMatch = data.toString().match(new RegExp(collabRe.source, 'gm'))
    if (!collabMatch)
      throw new Error('Could not find collaborator section in README')
    let collaborators = collabMatch.map((c) => {
      let m = c.match(collabRe)
      return { handle: m[1], name: m[2] }
    })

    map(collaborators, fetchAvatar, afterMap)

    function afterMap (err, collaborators) {
      if (err)
        throw err

      collaborators = collaborators.reduce((p, c, i) => {
        if (i % columns === 0) {
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

      let html = `
<html>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<body>
<table>
${collaborators}
</table>
</body>
</html>
      `

      fs.writeFileSync(avatarCacheFile, JSON.stringify(avatarCache, null, 2), 'utf8')
      fs.writeFileSync('table.html', html, 'utf8')
      console.log('Wrote table to table.html')
    }
  })
}
