// Copyright 2017-2018 The qitmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.
const utils = require('./utils')
const varuint = require('varuint-bitcoin')
const Transaction = require('./transaction')
const hash = require('./hash')
const fastMerkleRoot = require('merkle-lib/fastRoot')
const Bignumber = require('bignumber.js')
const types = require('./types')
const typecheck = require('./typecheck')

module.exports = Block

// version + parentRoot + txRoot + stateRoot + difficulty + height + timestamp + nonce
// 124 = 4 + 32 + 32 + 32 + 4 + 8 + 8 + 8

const BlockHeaderSize = 128

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
  block.timestamp = readUInt64()
  // block.nonce = readUInt64()

  // block.nonce > 2^53-1
  const nonceBuffer = readSlice(8)
  block.nonce = Bignumber( '0x' + nonceBuffer.reverse().toString('hex') ).toString()

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

Block.prototype.toBuffer = function (headersOnly) {
  const buffer = Buffer.allocUnsafe(this.byteLength(headersOnly))
  let offset = 0

  function writeSlice (slice) {
    slice.copy(buffer, offset)
    offset += slice.length
  }
  function writeInt32 (i) {
    buffer.writeInt32LE(i, offset)
    offset += 4
  }
  function writeUInt32 (i) {
    buffer.writeUInt32LE(i, offset)
    offset += 4
  }
  function writeUInt64 (i) {
    utils.writeUInt64LE(buffer, i, offset)
    offset += 8
  }

  writeInt32(this.version)
  writeSlice(this.parentRoot)
  writeSlice(this.txRoot)
  writeSlice(this.stateRoot)
  writeUInt32(this.difficulty)
  writeUInt64(this.height)
  writeUInt64(this.timestamp)
  // writeUInt64(this.nonce)

  // nonce > 2*53-1
  typecheck(types.String, this.nonce)
  typecheck(types.Number, Number(this.nonce))
  const nonce = Bignumber(this.nonce)
  writeSlice(Buffer.from(nonce.toString(16),'hex'))

  if (headersOnly || !this.transactions) return buffer

  varuint.encode(this.transactions.length, buffer, offset)
  offset += varuint.encode.bytes

  this.transactions.forEach(function (tx) {
    const txSize = tx.byteLength() // TODO: extract from toBuffer?
    tx.toBuffer(buffer, offset)
    offset += txSize
  })

  return buffer
}

Block.prototype.getHashBuffer = function () {
  return hash.dblake2b256(this.toBuffer(true))
}

Block.prototype.getHash = function () {
  return this.getHashBuffer().reverse().toString('hex')
}

Block.calculateTxRoot = function (transactions) {
  if (transactions.length === 0) throw TypeError('Cannot compute merkle root for zero transactions')

  const hashes = transactions.map(function (transaction) {
    return transaction.getHashFull()
  })

  return fastMerkleRoot(hashes, hash.dblake2b256)
}

Block.prototype.checkTxRoot = function () {
  if (!this.transactions) return false

  const actualTxRoot = Block.calculateTxRoot(this.transactions)
  return this.merkleRoot.compare(actualTxRoot) === 0
}
