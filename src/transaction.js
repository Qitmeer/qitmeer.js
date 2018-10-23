// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const utils = require('./utils')
const varuint = require('varuint-bitcoin')
const hash = require('./hash')

module.exports = Transaction

function varSliceSize (someScript) {
  const length = someScript.length

  return varuint.encodingLength(length) + length
}

const TxSerializeFull = 0
const TxSerializeNoWitness = 1
const TxSerializeOnlyWitness = 2

function Transaction () {
  this.version = 1
  this._stype = 0 // default = 0, TxSerializeType : 0 - full , 1 - no-witness, 2 - only-witness
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

  tx.version = readUInt16() // tx version

  tx._stype = readUInt16() // tx serialize type
  if (tx._stype !== TxSerializeFull && tx._stype !== TxSerializeNoWitness && tx._stype !== TxSerializeOnlyWitness) {
    throw new Error('unsupported tx serialize type')
  }
  let vinLen = 0
  if (tx._stype === TxSerializeFull || tx._stype === TxSerializeNoWitness) {
    vinLen = readVarInt()
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
  }

  let hasWitnesses = tx._stype !== TxSerializeNoWitness
  if (hasWitnesses) {
    const witnessLen = readVarInt()
    if (witnessLen > 0 && witnessLen !== vinLen) throw new Error('Wrong witness length')
    vinLen = witnessLen
  }
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

Transaction.prototype.hasWitnesses = function () {
  return this._stype === 0
}

Transaction.prototype.byteLength = function (stype) {
  let hasWitnesses = this.hasWitnesses()
  let onlyWitnesses = false
  if (stype !== undefined) {
    hasWitnesses = (stype === TxSerializeFull || stype === TxSerializeOnlyWitness)
    onlyWitnesses = (stype === TxSerializeOnlyWitness)
  }
  const length =
    4 + // version
    (onlyWitnesses ? 0 : varuint.encodingLength(this.vin.length)) +
    (onlyWitnesses ? 0 : varuint.encodingLength(this.vout.length)) +
    (onlyWitnesses ? 0 : this.vin.reduce(function (sum, input) { return sum + 32 + 4 + 4 }, 0)) + // txid + vout + seq
    (onlyWitnesses ? 0 : this.vout.reduce(function (sum, output) { return sum + 8 + varSliceSize(output.script) }, 0)) + // amount + script
    (onlyWitnesses ? 0 : 4 + 4) + // lock-time + expire
    (hasWitnesses ? varuint.encodingLength(this.vin.length) : 0) + // the varint for witness
    (hasWitnesses ? this.vin.reduce(function (sum, input) { return sum + 8 + 4 + 4 + varSliceSize(input.script) }, 0) : 0)
  // amountin + blockheight + txindex + script
  return length
}

Transaction.prototype.toBuffer = function (buffer, initialOffset, stype) {
  if (!buffer) buffer = Buffer.allocUnsafe(this.byteLength(stype))

  let offset = initialOffset || 0

  function writeSlice (slice) { offset += slice.copy(buffer, offset) }

  function writeUInt16 (i) { offset = buffer.writeUInt16LE(i, offset) }

  function writeUInt32 (i) { offset = buffer.writeUInt32LE(i, offset) }

  function writeInt32 (i) { offset = buffer.writeInt32LE(i, offset) }

  function writeUInt64 (i) { offset = utils.writeUInt64LE(buffer, i, offset) }

  function writeVarInt (i) {
    varuint.encode(i, buffer, offset)
    offset += varuint.encode.bytes
  }

  function writeVarSlice (slice) {
    writeVarInt(slice.length)
    writeSlice(slice)
  }

  let serializeType = stype || this._stype

  if (serializeType === TxSerializeFull) {
    writeInt32(this.version)
  } else {
    writeUInt16(this.version)
    writeUInt16(stype)
  }

  if (serializeType === TxSerializeFull || serializeType === TxSerializeNoWitness) {
    writeVarInt(this.vin.length)
    this.vin.forEach(function (txIn) {
      writeSlice(txIn.txid)
      writeUInt32(txIn.vout)
      writeUInt32(txIn.sequence)
    })

    writeVarInt(this.vout.length)
    this.vout.forEach(function (txOut) {
      writeUInt64(txOut.amount)
      writeVarSlice(txOut.script)
    })

    writeUInt32(this.locktime)
    writeUInt32(this.exprie)
  }

  if (serializeType !== TxSerializeNoWitness) {
    writeVarInt(this.vin.length)
    this.vin.forEach(function (input) {
      writeUInt64(input.amountin)
      writeUInt32(input.blockheight)
      writeUInt32(input.txindex)
      writeVarSlice(input.script)
    })
  }
  // avoid slicing unless necessary
  if (initialOffset !== undefined) return buffer.slice(initialOffset, offset)
  return buffer
}

Transaction.prototype.getHash = function () {
  return hash.dblake2b256(this.toBuffer(undefined, undefined, TxSerializeNoWitness))
}

Transaction.prototype.getId = function () {
  // transaction hash's are displayed in reverse order
  return this.getHash().reverse().toString('hex')
}

Transaction.prototype.getHashFull = function () {
  const prefixHash = this.getHash()
  const witnessHash = hash.dblake2b256(this.toBuffer(undefined, undefined, TxSerializeOnlyWitness))
  return hash.dblake2b256(Buffer.concat([prefixHash, witnessHash]))
}

Transaction.prototype.getHashFullId = function () {
  // transaction hash's are displayed in reverse order
  return this.getHashFull().reverse().toString('hex')
}
