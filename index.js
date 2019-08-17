#!/usr/bin/env node

const co = require('co')
const memjs = require('memjs')
const vorpal = require('vorpal')()

const server = process.argv[2] || 'localhost:11211'
const client = memjs.Client.create(server)

// HACK
// memjs does not throw error even if connection failed
// so trigger get method once to check it
client.get('0', err => {
  if (err) throw new Error(`Fail to connect to ${server}`)
})

const METHOD_DESCRIPTION = {
  get: 'Get the value of a key',
  set: 'Set the value of a key',
  add: 'Set the value of a key, fail if key exists',
  replace: 'Overwrite existing key, fail if key not exists',
  delete: 'Delete a key',
  increment: 'increment',
  decrement: 'decrement',
  flush: 'Flush all data',
  stats: 'Show statistics',
}

// Get all methods name
const METHODS = Object.keys(METHOD_DESCRIPTION)

function getCommand(method) {
  switch (method) {
    // No argument
    case 'flush':
    case 'stats':
      return {
        command: method,
        query: () => cb => client[method](cb),
      }

    // One argument, key
    case 'get':
    case 'delete':
      return {
        command: `${method} <key>`,
        query: args => cb => client[method](args.key.toString(), cb),
      }

    // key, value, expires(optional)
    case 'set':
    case 'add':
    case 'replace':
      return {
        command: `${method} <key> <value> [expires]`,
        query: args => cb =>
          client[method](
            args.key.toString(),
            args.value.toString(),
            {'expires': Number(args.expires) || 0},
            cb,
          ), // eslint-disable-line
      }

    // key, amount, expires(optional)
    case 'increment':
    case 'decrement':
      return {
        command: `${method} <key> <amount> [expires]`,
        query: args => cb =>
          client[method](
            args.key.toString(),
            args.amount.toString(),
            {'expires': Number(args.expires) || 0},
            cb,
          ), // eslint-disable-line
      }
    default:
      throw new Error(`\`${method}\` is not supported`)
  }
}

// How to parse
function getParse(method) {
  switch (method) {
    case 'get':
      return arr => {
        const value = arr[0]

        if (value === null) {
          return null
        }

        return value.toString()
      }
    case 'stats':
      return arr => {
        const serverInfo = arr[0]
        const result = arr[1]

        // Make STATS result more readable
        const data = Object.keys(result).reduce((res, key) => {
          res.push(`${key} ${arr[1][key]}`)
          return res
        }, [])

        // Add server info
        data.unshift(`server ${serverInfo}`)
        return data.join('\n')
      }

    default:
      return arg => arg
  }
}

// Register all methods to vorpal
METHODS.forEach(method => {
  const opt = getCommand(method)
  const command = opt.command
  const query = opt.query
  const description = METHOD_DESCRIPTION[method]
  const parse = getParse(method)

  vorpal
    .command(command)
    .description(description)
    .action(function action(args) {
      return co(function* wrap() {
        return yield query(args)
      })
        .then(data => this.log(parse(data)))
        .catch(err => this.log(err))
    })
})

const PREFIX_MAX_LENGTH = 50

// Use server address as CLI prefix, cut if too long
function makePrefix(fullAddr) {
  // remove 'username:password'
  const addr = fullAddr.includes('@') ? fullAddr.split('@')[1] : fullAddr

  if (server.length > PREFIX_MAX_LENGTH) {
    return `${addr.slice(0, PREFIX_MAX_LENGTH - 3)}...>`
  }

  return `${addr}>`
}

vorpal.delimiter(makePrefix(server)).show()
