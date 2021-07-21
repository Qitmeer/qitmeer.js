// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.
// const utils = require('./utils')
const varuint = require('varuint-bitcoin')
const Transaction = require('./transaction')
const hash = require('./hash')
const fastMerkleRoot = require('merkle-lib/fastRoot')

module.exports = Block

// version + parentRoot + txRoot + stateRoot + difficulty + timestamp + pow( nonce + pow_type + edge_bits + circle_nonces )
const BlockHeaderSize = 4 + 32 + 32 + 32 + 4 + 4 + (4 + 1 + 1 + 168)

function Block () {
  this.version = 1
  this.parentRoot = null
  this.txRoot = null
  this.stateRoot = null
  this.difficulty = 0
  this.timestamp = 0
  this.nonce = 0
  this.transactions = []
  this.parents = []
  this.pow = {}
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

  // function readUInt64 () {
  //   const i = utils.readUInt64LE(buffer, offset)
  //   offset += 8
  //   return i
  // }

  const block = new Block()
  block.version = readInt32()
  block.parentRoot = readSlice(32)
  block.txRoot = readSlice(32)
  block.stateRoot = readSlice(32)
  block.difficulty = readUInt32()
  block.timestamp = new Date(readUInt32() * 1000)

  function readVarInt () {
    const vi = varuint.decode(buffer, offset)
    offset += varuint.decode.bytes
    return vi
  }

  // pow
  block.pow = {}
  block.pow.nonce = readUInt32()
  block.pow.pow_type = readVarInt()
  block.pow.proof_data = {
    edge_bits: readVarInt(),
    circle_nonces: readSlice(168)
  }

  if (buffer.length === BlockHeaderSize) return block
  // parents
  const parentsLength = readVarInt()

  for (let i = 0; i < parentsLength; ++i) {
    const parent = readSlice(32)
    block.parents.push(parent)
  }

  function readTransaction () {
    const tx = Transaction.fromBuffer(buffer.slice(offset), true)
    offset += tx.byteLength()
    return tx
  }

  const nTransactions = readVarInt()

  for (let i = 0; i < nTransactions; ++i) {
    const tx = readTransaction()
    block.transactions.push(tx)
  }

  return block
}

Block.prototype.byteLength = function (headersOnly) {
  if (headersOnly || !this.transactions) return BlockHeaderSize
  const transactionsLenth = varuint.encodingLength(this.transactions.length)
  const transactionsByteLength = this.transactions.reduce(function (a, x) {
    return a + x.byteLength()
  }, 0)
  const parentsLenth = varuint.encodingLength(this.parents.length) + this.parents.length * 32
  return BlockHeaderSize + transactionsLenth + transactionsByteLength + parentsLenth
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
  // function writeUInt64 (i) {
  //   utils.writeUInt64LE(buffer, i, offset)
  //   offset += 8
  // }

  function writeVarInt (i) {
    varuint.encode(i, buffer, offset)
    offset += varuint.encode.bytes
  }

  writeInt32(this.version)
  writeSlice(this.parentRoot)
  writeSlice(this.txRoot)
  writeSlice(this.stateRoot)
  writeUInt32(this.difficulty)

  const timestamp = new Date(this.timestamp) / 1000
  writeUInt32(timestamp)

  // pow
  writeUInt32(this.pow.nonce)
  writeVarInt(this.pow.pow_type)
  writeVarInt(this.pow.proof_data.edge_bits)
  writeSlice(this.pow.proof_data.circle_nonces)

  if (headersOnly || !this.transactions) return buffer

  // parents
  writeVarInt(this.parents.length)
  this.parents.forEach(function (parent) {
    writeSlice(parent)
  })

  writeVarInt(this.transactions.length)

  this.transactions.forEach(function (tx) {
    const txSize = tx.byteLength() // TODO: extract from toBuffer?
    tx.toBuffer(buffer, offset)
    offset += txSize
  })

  return buffer
}

Block.prototype.getHashBuffer = function () {
  return hash.dblake2b256(this.toBuffer(true).slice(0, BlockHeaderSize - 169))
}

Block.prototype.getHash = function () {
  return this.getHashBuffer().reverse().toString('hex')
}

Block.calculateTxRoot = function (transactions) {
  if (transactions.length === 0) throw TypeError('Cannot compute merkle root for zero transactions')

  const hashes = transactions.map(function (transaction) {
    return transaction.getTxIdBuffer()
  })

  return fastMerkleRoot(hashes, hash.dblake2b256)
}

Block.prototype.checkTxRoot = function () {
  if (!this.transactions) return false

  const actualTxRoot = Block.calculateTxRoot(this.transactions)
  return this.merkleRoot.compare(actualTxRoot) === 0
}
