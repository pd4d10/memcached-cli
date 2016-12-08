# memcached-cli

A simple memcached CLI tool, with SASL supported. Built upon [`memjs`](https://github.com/alevy/memjs).

[![Build Status](https://travis-ci.org/pd4d10/memcached-cli.svg?branch=master)](https://travis-ci.org/pd4d10/memcached-cli)
[![npm](https://img.shields.io/npm/v/memcached-cli.svg)](https://www.npmjs.com/package/memcached-cli)
[![License](https://img.shields.io/npm/l/memcached-cli.svg)](https://www.npmjs.com/package/memcached-cli)

## Installation

```sh
# npm
npm install -g memcached-cli
# yarn
yarn global add memcached-cli
```

## Usage

Run

```
memcached-cli host:port
```

to enter interactive shell. If `host` and `port` is not specified, `localhost:11211` will be used.

If you use SASL auth, run

```sh
> memcached-cli username:password@host:port
```

Method | Description | Command
---|---|---
get | Get the value of a key | `> get <key>`
set | Set the value of a key, default expires(s) is 0 | `> set <key> <value> [expires]`
add | Set the value of a key, fail if key exists | `> add <key> <value> [expires]`
replace | Overwrite existing key, fail if key not exists | `> replace <key> <value> [expires]`
delete | Delete a key | `> delete <key>`
flush | Flush all data | `> flush`
stats | Show statistics | `> stats`

`memcached-cli` is built upon `memjs`. Visit [memjs documentation](http://alevy.github.io/memjs/) for more information.

## License

MIT
