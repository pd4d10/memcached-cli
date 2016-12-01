const memjs = require('memjs')
const inquirer = require('inquirer')

const client = memjs.Client.create()

function parse(input) {
  const arr = input.split(/\s+/)
  return {
    method: arr[0],
    key: arr[1],
  }
}

function query(option, cb) {
  switch (option.method) {
    case 'get':
      client.get(option.key, cb)
      break;
    default:
      break;
  }

  client.close()
}

inquirer.prompt([
  {
    type: 'input',
    name: 'command',
    message: 'memcached >',
  },
]).then(input => {
  const option = parse(input.command)
  query(option, (err, data) => {
    console.log(data)
  })
})
