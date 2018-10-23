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
  this.vin = []
  this.vout = []
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

  const tx = new Transaction()
  tx.version = readUInt16()
  const sver = readUInt16()
  let hasWitnesses = (sver === 0)

  const vinLen = readVarInt()
  for (var i = 0; i < vinLen; ++i) {
    tx.vin.push({
      txid: readSlice(32),
      vout: readUInt32(),
      sequence: readUInt32()
    })
  }

  const voutLen = readVarInt()
  for (i = 0; i < voutLen; ++i) {
    tx.vout.push({
      amount: readUInt64(),
      script: readVarSlice()
    })
  }
  tx.locktime = readUInt32()
  tx.exprie = readUInt32()

  const witnessLen = hasWitnesses ? readVarInt() : 0
  if (witnessLen > 0 && witnessLen !== vinLen) throw new Error('Wrong witness length')

  for (i = 0; i < vinLen; ++i) {
    tx.vin[i].amountin = hasWitnesses ? readUInt64() : 0
    tx.vin[i].blockheight = hasWitnesses ? readUInt32() : 0
    tx.vin[i].txindex = hasWitnesses ? readUInt32() : 0
    tx.vin[i].script = hasWitnesses ? readVarSlice() : Buffer.from('', 'hex')
  }

  if (__noStrict) return tx
  if (offset !== buffer.length) throw new Error('Transaction has unexpected data')

  return tx
}
