// Copyright 2017-2018 The Qirmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

'use strict'

const base58 = require('bs58')
const Buffer = require('safe-buffer').Buffer
const hash = require('./hash')

module.exports = {
  default: Qitmeer58checkBase(hash.dblake2b256),
  Qitmeer58checkdsha256: Qitmeer58checkBase(hash.dsha256),
  Qitmeer58checkBase: Qitmeer58checkBase
}

function Qitmeer58checkBase (checksumFn) {
  // Encode a buffer as a base58-check encoded string
  function encode (payload) {
    var checksum = checksumFn(payload)

    return base58.encode(Buffer.concat([
      payload,
      checksum
    ], payload.length + 4))
  }

  function decodeRaw (buffer) {
    var payload = buffer.slice(0, -4)
    var checksum = buffer.slice(-4)
    var newChecksum = checksumFn(payload)
    if (checksum[0] ^ newChecksum[0] |
      checksum[1] ^ newChecksum[1] |
      checksum[2] ^ newChecksum[2] |
      checksum[3] ^ newChecksum[3]) return

    return payload
  }

  // Decode a base58-check encoded string to a buffer, no result if checksum is wrong
  function decodeUnsafe (string) {
    var buffer = base58.decodeUnsafe(string)
    if (!buffer) return

    return decodeRaw(buffer)
  }

  function decode (string) {
    var buffer = base58.decode(string)
    var payload = decodeRaw(buffer, checksumFn)
    if (!payload) throw new Error('Invalid checksum')
    return payload
  }

  return {
    encode: encode,
    decode: decode,
    decodeUnsafe: decodeUnsafe
  }
}
