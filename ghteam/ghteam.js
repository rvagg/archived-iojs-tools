#!/usr/bin/env node
'use strict'

const ghauth = require('ghauth')
const ghteams = require('ghteams')
const path = require('path')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const pkgToId = require('pkg-to-id')
const hyperquest = require('hyperquest')
const bl = require('bl')

const collabRe = '^\\* \\[([^\\]]+)\\]\\([^\\)]+\\) - \\*\\*([^\\*]+)\\*\\* &lt;([^&]+)&gt;$'
const pkgFile = path.join(process.cwd(), 'package.json')
const pkgData = fs.existsSync(pkgFile) ? require(pkgFile) : {}
const pkgId = pkgToId(pkgData)
const ghUser = pkgId.user || 'nodejs'
const ghRepo = pkgId.name || 'node'
const authOptions = {configName : 'ghteam', scopes: ['user']}

const contribs =
  'https://raw.githubusercontent.com/nodejs/node/master/README.md'

ghauth(authOptions, (err, authData) => {
  if (err)
    throw err

  let cmd = argv._[0]
  let org = argv._[1].split('/',1)[0]
  let team = argv._[2] || argv._[1].split('/',2)[1]
  
  if (cmd === undefined)
    showHelp()

  switch(cmd) {
    case 'list':
      if (!org) showHelp()
      return list(authData, org, argv.json)
    case 'get':
      if (!org || !team) showHelp()
      return get(authData, org, team, argv.json)
    case 'members':
      if (!org || !team) showHelp()
      return members(authData, org, team, argv.json)
    case 'email':
      if (!org || !team) showHelp()
      return email(authData, org, team, argv.json)
    default:
      console.error(`Unknown command: ${cmd}`)
      showHelp()
  }

})

function list(authData, org, json) {
  ghteams.list(authData, org, (err,teams)=> {
    if (err) {
      console.error('Cannot list teams', err)
      process.exit(1)
    }
    if (json) {
      console.log(JSON.stringify(teams,null,2))
    } else {
      for (let team of teams) {
        console.log(`${team.name} (${org}/${team.slug})`)
      }
    }
  })
}

function get(authData, org, team) {
  ghteams.get(authData, org, team, (err,info)=> {
    if (err) {
      console.error('Cannot get info', err)
      process.exit(1)
    }
    if (json) {
      console.log(JSON.stringify(info,null,2))
    } else {
      console.log('Name: ', `${info.name} (${org}/${team})`)
      console.log('Description: ', info.description)
      console.log('Members: ', info.members_count)
    }
  })
}

function members(authData, org, team, json) {
  ghteams.members(authData, org, team, (err,members)=> {
    if (err) {
      console.error('Cannot get info', err)
      process.exit(1)
    }
    if (json) {
      console.log(JSON.stringify(members,null,2))
    } else {
      for (let member of members) {
        console.log(`@${member.login}`)
      }
    }
  })
}

function email(authData, org, team, json) {
  ghteams.members(authData, org, team, (err,members)=> {
    if (err) {
      console.error('Cannot get info', err)
      process.exit(1)
    }
    listCollaborators((err,collaborators)=>{
      if (err) {
        console.log(err.message)
        process.exit(1)
      }
      if (json) {
        let out = []
        for (let member of members) {
          let data = collaborators[member.login.toLowerCase()]
          if (data && data.email) {
            out.push(data.email)
          }
        }
        console.log(JSON.stringify(out,null,2))
      } else {
        let res = []
        for (let member of members) {
          let data = collaborators[member.login.toLowerCase()]
          if (data && data.email) {
            res.push(`${data.name||data.login} <${data.email}>`)
          }
        }
        console.log(res.join(', '))
      }
    })
    // console.log(members)
  })
}

function showHelp() {
  console.log('ghteam <command> \n' +
              '  Commands:\n' +
              '    list <org>\n' +
              '    get <org> <team>\n' +
              '    members <org> <team>\n' +
              '    email <org> <team>\n\n' +
              '  Examples:\n' +
              '    $ ghteam list nodejs\n' +
              '    $ ghteam members nodejs lts\n' +
              '    $ ghteam email nodejs lts\n\n')
  process.exit(1)
}

function listCollaborators (callback) {
  hyperquest.get(contribs)
    .pipe(bl((err, body) => {
      if (err)
        return callback(err)

      let collaborators = body.toString().match(new RegExp(collabRe, 'mg'))

      if (!collaborators)
        return callback(
          new Error('Could not list collaborators from Node.js README'))

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
        return callback(
          new Error('Could not list collaborators from Node.js README'))
          
      callback(null, collaborators)
    }))
}
