// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.
const utils = require('./utils')
const varuint = require('varuint-bitcoin')
const Transaction = require('./transaction')

module.exports = Block

// version + parentRoot + txRoot + stateRoot + difficulty + height + timestamp + nonce
// 124 = 4 + 32 + 32 + 32 + 4 + 8 + 4 + 8
const BlockHeaderSize = 124

function Block () {
  this.version = 1
  this.parentRoot = null
  this.txRoot = null
  this.stateRoot = null
  this.difficulty = 0
  this.height = 0
  this.timestamp = 0
  this.nonce = 0
  this.transactions = []
}

Block.fromBuffer = function (buffer) {
  if (buffer.length < 80) throw new Error('Buffer too small (< 80 bytes)')

  let offset = 0
  function readSlice (n) {
    offset += n
    return buffer.slice(offset - n, offset)
  }

  function readUInt32 () {
    const i = buffer.readUInt32LE(offset)
    offset += 4
    return i
  }

  function readInt32 () {
    const i = buffer.readInt32LE(offset)
    offset += 4
    return i
  }

  function readUInt64 () {
    const i = utils.readUInt64LE(buffer, offset)
    offset += 8
    return i
  }

  const block = new Block()
  block.version = readInt32()
  block.parentRoot = readSlice(32)
  block.txRoot = readSlice(32)
  block.stateRoot = readSlice(32)
  block.difficulty = readUInt32()
  block.height = readUInt64()
  block.timestamp = readUInt32()
  block.nonce = readUInt64()

  if (buffer.length === BlockHeaderSize) return block

  function readVarInt () {
    const vi = varuint.decode(buffer, offset)
    offset += varuint.decode.bytes
    return vi
  }

  function readTransaction () {
    const tx = Transaction.fromBuffer(buffer.slice(offset), true)
    offset += tx.byteLength()
    return tx
  }

  const nTransactions = readVarInt()

  for (var i = 0; i < nTransactions; ++i) {
    const tx = readTransaction()
    block.transactions.push(tx)
  }

  return block
}

Block.prototype.byteLength = function (headersOnly) {
  if (headersOnly || !this.transactions) return BlockHeaderSize

  return BlockHeaderSize + varuint.encodingLength(this.transactions.length) + this.transactions.reduce(function (a, x) {
    return a + x.byteLength()
  }, 0)
}
