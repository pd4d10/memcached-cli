const co = require('co')
const memjs = require('memjs')
const vorpal = require('vorpal')()

const client = memjs.Client.create()

const config = {
  get: {
    command: 'get <key>',
    description: 'GET',
  },
  set: {
    command: 'set <key> <value> [expires]',
    description: 'SET',
  },
  add: {
    command: 'add <key> <value> [expires]',
    description: 'ADD',
  },
  replace: {
    command: 'replace <key> <value> [expires]',
    description: 'replace',
  },
}

function parse(data) {
  try {
    return data.toString()
  } catch (err) {
    return data
  }
}

const methods = Object.keys(config)

methods.forEach((method) => {
  const option = config[method]

  vorpal
    .command(option.command)
    .description(option.description)
    .action(function (args) {
      let promise

      switch (method) {
        case 'get':
          promise = co(function* () {
            return yield cb => client.get(args.key, cb)
          })
          break
        case 'set':
        case 'add':
        case 'replace':
          promise = co(function* () {
            return yield cb => client[method](args.key, args.value, cb, args.expires)
          })
          break
      }

      return promise.then((data) => {
        this.log(parse(data.toString()))
        client.close()
      })
    })
})

vorpal.delimiter('memcached >').show()
