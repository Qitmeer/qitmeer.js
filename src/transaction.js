// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const utils = require('./utils')
const varuint = require('varuint-bitcoin')

module.exports = Transaction

function Transaction () {
  this.version = 1
  this.locktime = 0
  this.exprie = 0
  this.ins = []
  this.outs = []
}

Transaction.fromBuffer = function (buffer, __noStrict) {
  let offset = 0
  function readSlice (n) {
    offset += n
    return buffer.slice(offset - n, offset)
  }

  function readUInt16 () {
    const i = buffer.readUInt16LE(offset)
    offset += 2
    return i
  }

  function readUInt32 () {
    const i = buffer.readUInt32LE(offset)
    offset += 4
    return i
  }

  function readUInt64 () {
    const i = utils.readUInt64LE(buffer, offset)
    offset += 8
    return i
  }

  function readVarInt () {
    const vi = varuint.decode(buffer, offset)
    offset += varuint.decode.bytes
    return vi
  }

  function readVarSlice () {
    return readSlice(readVarInt())
  }

  function readVector () {
    const count = readVarInt()
    const vector = []
    for (var i = 0; i < count; i++) vector.push(readVarSlice())
    return vector
  }

  const tx = new Transaction()
  tx.version = readUInt16()
  const sver = readUInt16()
  let hasWitnesses = (sver === 0)

  const vinLen = readVarInt()
  for (var i = 0; i < vinLen; ++i) {
    tx.ins.push({
      hash: readSlice(32),
      index: readUInt32(),
      sequence: readUInt32(),
      script: hasWitnesses ? readVarSlice() : null,
      witness: []
    })
  }

  const voutLen = readVarInt()
  for (i = 0; i < voutLen; ++i) {
    tx.outs.push({
      value: readUInt64(),
      script: readVarSlice()
    })
  }

  for (i = 0; i < vinLen; ++i) {
    tx.ins[i].witness = hasWitnesses ? readVector() : null
  }

  tx.locktime = readUInt32()
  tx.exprie = readUInt32()

  if (__noStrict) return tx
  if (offset !== buffer.length) throw new Error('Transaction has unexpected data')

  return tx
}
