// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const nox58check = require('./nox58check')

module.exports = {
  fromBase58Check: fromBase58Check
}

function fromBase58Check (address) {
  const payload = nox58check.decode(address)

  if (payload.length < 22) throw new TypeError(address + ' is too short')
  if (payload.length > 22) throw new TypeError(address + ' is too long')

  const version = payload.readUInt16LE(0)
  const hash = payload.slice(2)

  return { version: version, hash: hash }
}
