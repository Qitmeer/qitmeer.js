// Copyright 2017-2018 The qitmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const Buffer = require('safe-buffer').Buffer
const utils = require('./utils')
const varuint = require('varuint-bitcoin')
const hash = require('./hash')
const types = require('./types')
const typecheck = require('./typecheck')

module.exports = Transaction

function varSliceSize (someScript) {
  const length = someScript.length

  return varuint.encodingLength(length) + length
}

// default sequence 4294967295
Transaction.DEFAULT_SEQUENCE = 0xffffffff

// SignatureHashType
Transaction.SIGHASH_ALL = 0x01
Transaction.SIGHASH_NONE = 0x02
Transaction.SIGHASH_SINGLE = 0x03
Transaction.SIGHASH_ANYONECANPAY = 0x80

const SigHashMask = 0x1f
const SigHashSerializePrefix = 1
const SigHashSerializeWitness = 3
const EMPTY_SCRIPT = Buffer.allocUnsafe(0)
const BLANK_OUTPUT = {
  amount: 0,
  script: EMPTY_SCRIPT
}

// SerializeType
Transaction.TxSerializeFull = 0
Transaction.TxSerializeNoWitness = 1
Transaction.TxSerializeOnlyWitness = 2

function Transaction () {
  this.version = 1
  this._stype = 0 // default = 0, TxSerializeType : 0 - full , 1 - no-witness, 2 - only-witness
  this.locktime = 0
  this.exprie = 0
  this.timestamp = 0
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
  if (tx._stype !== Transaction.TxSerializeFull &&
    tx._stype !== Transaction.TxSerializeNoWitness &&
    tx._stype !== Transaction.TxSerializeOnlyWitness) {
    throw new Error('unsupported tx serialize type ' + tx._stype)
  }
  let vinLen = 0
  if (tx._stype === Transaction.TxSerializeFull ||
    tx._stype === Transaction.TxSerializeNoWitness) {
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

  const hasWitnesses = tx._stype !== Transaction.TxSerializeNoWitness

  tx.timestamp = hasWitnesses ? readUInt32() : 0

  if (hasWitnesses) {
    const witnessLen = readVarInt()
    if (witnessLen > 0 && witnessLen !== vinLen) throw new Error('Wrong witness length')
    vinLen = witnessLen
  }
  for (i = 0; i < vinLen; ++i) {
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
    hasWitnesses = (stype === Transaction.TxSerializeFull || stype === Transaction.TxSerializeOnlyWitness)
    onlyWitnesses = (stype === Transaction.TxSerializeOnlyWitness)
  }
  const length =
    4 + // version
    (onlyWitnesses ? 0 : varuint.encodingLength(this.vin.length)) +
    (onlyWitnesses ? 0 : varuint.encodingLength(this.vout.length)) +
    (onlyWitnesses ? 0 : this.vin.reduce(function (sum, input) { return sum + 32 + 4 + 4 }, 0)) + // txid + vout + seq
    (onlyWitnesses ? 0 : this.vout.reduce(function (sum, output) { return 4 + sum + 8 + varSliceSize(output.script) }, 0)) + // coinId + amount + script
    (onlyWitnesses ? 0 : 4 + 4) + // lock-time + expire
    (hasWitnesses ? 4 : 0) + // Timestamp
    (hasWitnesses ? varuint.encodingLength(this.vin.length) : 0) + // the varint for witness
    (hasWitnesses ? this.vin.reduce(function (sum, input) {
      return sum + (Buffer.alloc(2).compare(input.script) === 0 ? 1 : varSliceSize(input.script))
    }, 0) : 0) // script
  return length
}

Transaction.prototype.toHex = function () {
  return this.toBuffer().toString('hex')
}
Transaction.prototype.toBuffer = function (buffer, initialOffset, stype) {
  if (!buffer) buffer = Buffer.alloc(this.byteLength(stype))
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

  const serializeType = stype || this._stype

  if (serializeType === Transaction.TxSerializeFull) {
    writeInt32(this.version)
  } else {
    writeUInt16(this.version)
    writeUInt16(stype)
  }

  if (serializeType === Transaction.TxSerializeFull ||
    serializeType === Transaction.TxSerializeNoWitness) {
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

  if (serializeType !== Transaction.TxSerializeNoWitness) {
    writeUInt32(this.timestamp)
  }

  if (serializeType !== Transaction.TxSerializeNoWitness) {
    writeVarInt(this.vin.length)
    this.vin.forEach(function (input) {
      if (Buffer.alloc(2).compare(input.script) !== 0) writeVarSlice(input.script)
    })
  }
  // avoid slicing unless necessary
  if (initialOffset !== undefined) return buffer.slice(initialOffset, offset)
  return buffer
}

Transaction.prototype.getTxIdBuffer = function () {
  return hash.dblake2b256(this.toBuffer(undefined, undefined, Transaction.TxSerializeNoWitness))
}

Transaction.prototype.getTxId = function () {
  // transaction hash's are displayed in reverse order
  return this.getTxIdBuffer().reverse().toString('hex')
}

Transaction.prototype.getTxHash = function () {
  return this.getTxHashBuffer().reverse().toString('hex')
}

Transaction.prototype.getTxHashBuffer = function () {
  // transaction hash's are displayed in reverse order
  return hash.dblake2b256(Buffer.concat([this.toBuffer(undefined, undefined, Transaction.TxSerializeFull)]))
}

Transaction.prototype.addInput = function (hash, index, sequence, scriptSig) {
  typecheck(types.Hash256, hash)
  typecheck(types.UInt32, index)
  if (types.Nil(sequence)) {
    sequence = Transaction.DEFAULT_SEQUENCE
  }
  if (types.Nil(scriptSig)) {
    scriptSig = EMPTY_SCRIPT
  }
  // Add the input and return the input's index
  const size = this.vin.push({
    txid: hash,
    vout: index,
    sequence: sequence,
    script: scriptSig
  })
  return size - 1
}

Transaction.prototype.addOutput = function (scriptPubKey, amount, coinId = 0) {
  typecheck(types.Buffer, scriptPubKey)
  typecheck(types.Amount, amount)

  // Add the output and return the output's index
  return (this.vout.push({
    coinId,
    amount: amount,
    script: scriptPubKey
  }) - 1)
}

Transaction.prototype.setInputScript = function (index, scriptSig) {
  typecheck(types.Number, index)
  typecheck(types.Buffer, scriptSig)

  this.vin[index].script = scriptSig
}

Transaction.prototype.clone = function () {
  const newTx = new Transaction()
  newTx._stype = this._stype
  newTx.version = this.version
  newTx.vin = this.vin.map(function (txIn) {
    return {
      txid: txIn.txid,
      vout: txIn.vout,
      sequence: txIn.sequence,
      script: txIn.script
    }
  })
  newTx.vout = this.vout.map(function (txOut) {
    return {
      amount: txOut.amount,
      script: txOut.script
    }
  })
  newTx.locktime = this.locktime
  newTx.exprie = this.exprie
  newTx.timestamp = this.timestamp

  return newTx
}

// The hashed serialized transaction with the according hashType
// Which can be verified by signatureScript (aka. pubkey and signature)
Transaction.prototype.hashForSignature = function (inIndex, prevOutScript, hashType) {
  const fSingle = (hashType & SigHashMask) === Transaction.SIGHASH_SINGLE
  const fNone = (hashType & SigHashMask) === Transaction.SIGHASH_NONE
  const fAnyOne = (hashType & Transaction.SIGHASH_ANYONECANPAY) !== 0

  // the reference SignHash implementation from :
  // https://github.com/bitcoin/bitcoin/blob/master/src/script/interpreter.cpp

  // check for invalid inIndex
  if (inIndex >= this.vin.length) {
    throw new Error('invalid input index ' + inIndex +
      ', out of the range of tx input ' + this.vin.length)
  }
  // Check for invalid use of SIGHASH_SINGLE
  if (fSingle && (inIndex >= this.vout.length)) {
    // out of range of the nOut
    throw new Error('invalid input index ' + inIndex +
      'for SIGHASH_SINGLE, out of the range of tx output ' + this.vin.length)
  }

  // handle the passed scriptCode, skipping the OP_CODESEPARATOR
  // In case concatenating two scripts ends up with two code-separators,
  // or an extra one at the end, this prevents all those possible incompatibilities.
  // console.log(prevOutScript)
  const ourScript = prevOutScript.removeCodeSeparator().toBuffer()

  const txTmp = this.clone()

  // Handle Inputs
  // Blank other inputs completely,      SIGHASH_ANYONECANPAY
  if (fAnyOne) {
    txTmp.vin = [txTmp.vin[inIndex]]
    txTmp.vin[0].script = ourScript
  }
  // Blank only other inputs'signatures, SIGHASH_ALL
  txTmp.vin.forEach(function (input) { input.script = EMPTY_SCRIPT })
  txTmp.vin[inIndex].script = ourScript

  // Handle Outputs
  // Blank all output, and clear others sequence,  SIGHASH_NONE
  if (fNone) {
    txTmp.vout = []
    // ignore sequence numbers (except at inIndex)
    txTmp.vin.forEach(function (input, i) {
      if (i === inIndex) return
      input.sequence = 0
    })
  // Blank all other output except the same index, SIGHASH_SINGLE
  } else if (fSingle) {
    // truncate outputs after
    txTmp.vout.length = inIndex + 1

    // "blank" outputs before
    for (var i = 0; i < inIndex; i++) {
      txTmp.vout[i] = BLANK_OUTPUT
    }
    // ignore sequence numbers (except at inIndex)
    txTmp.vin.forEach(function (input, y) {
      if (y === inIndex) return
      input.sequence = 0
    })
  }
  // Serialize and Hash
  function sigHashPrefixSerializeSize (txIns, txOuts, inIndex) {
    // 1) 4 bytes version/serialization type
    // 2) number of inputs varint
    // 3) per input:
    //    a) 32 bytes prevout hash
    //    b) 4 bytes prevout index
    //    c) 1 byte prevout tree
    //    d) 4 bytes sequence
    // 4) number of outputs varint
    // 5) per output:
    //    a) 8 bytes amount
    //    b) 2 bytes script version
    //    c) pkscript len varint (1 byte if not SigHashSingle output)
    //    d) N bytes pkscript (0 bytes if not SigHashSingle output)
    // 6) 4 bytes lock time
    // 7) 4 bytes expiry
    const nTxIns = txIns.length
    const nTxOuts = txOuts.length
    let size = 4 + varuint.encodingLength(nTxIns) +
      nTxIns * (32 + 4 + 1 + 4) +
      varuint.encodingLength(nTxOuts) +
      nTxOuts * (8 + 2) +
      4 + 4
    txOuts.forEach(function (output, i) {
      let s = output.script
      if (fSingle && i !== inIndex) {
        s = EMPTY_SCRIPT
      }
      size += varuint.encodingLength(s.length)
      size += s.length
    })
    return size
  }
  function sigHashWitnessSerializeSize (txIns, signScript) {
    // 1) 4 bytes version/serialization type
    // 2) number of inputs varint
    // 3) per input:
    //    a) prevout pkscript varint (1 byte if not input being signed)
    //    b) N bytes prevout pkscript (0 bytes if not input being signed)
    //
    // NOTE: The prevout pkscript is replaced by nil for all inputs except
    // the input being signed.  Thus, all other inputs (aka numTxIns-1) commit
    // to a nil script which gets encoded as a single 0x00 byte.  This is
    // because encoding 0 as a varint results in 0x00 and there is no script
    // to write.  So, rather than looping through all inputs and manually
    // calculating the size per input, use (numTxIns - 1) as an
    // optimization.
    const nTxIns = txIns.length
    const size = 4 + varuint.encodingLength(nTxIns) + (nTxIns - 1) + varSliceSize(signScript)
    return size
  }

  function writeSlice (buffer, slice, offset) { const o = slice.copy(buffer, offset); return offset + o }

  function writeUInt16 (buffer, i, offset) { const o = buffer.writeUInt16LE(i, offset); return o }

  function writeUInt32 (buffer, i, offset) { const o = buffer.writeUInt32LE(i, offset); return o }

  function writeUInt64 (buffer, i, offset) { const o = utils.writeUInt64LE(buffer, i, offset); return o }

  function writeVarInt (buffer, i, offset) {
    varuint.encode(i, buffer, offset)
    const o = varuint.encode.bytes
    return offset + o
  }
  function writeVarSlice (buffer, slice, offset) {
    let o = writeVarInt(buffer, slice.length, offset)
    o = writeSlice(buffer, slice, o)
    return o
  }

  const prefixBuffer = Buffer.allocUnsafe(sigHashPrefixSerializeSize(txTmp.vin, txTmp.vout, inIndex))
  prefixBuffer.fill(0)

  // Commit to the version and hash serialization type.
  // prefix version
  let offset = 0
  offset = writeUInt16(prefixBuffer, txTmp.version, offset)
  offset = writeUInt16(prefixBuffer, SigHashSerializePrefix, offset)
  // txIn
  offset = writeVarInt(prefixBuffer, txTmp.vin.length, offset)
  txTmp.vin.forEach(function (txIn) {
    offset = writeSlice(prefixBuffer, txIn.txid, offset)
    offset = writeUInt32(prefixBuffer, txIn.vout, offset)
    offset = writeUInt32(prefixBuffer, txIn.sequence, offset)
  })
  // txOut
  offset = writeVarInt(prefixBuffer, txTmp.vout.length, offset)
  txTmp.vout.forEach(function (txOut) {
    offset = writeUInt64(prefixBuffer, txOut.amount, offset)
    offset = writeVarSlice(prefixBuffer, txOut.script, offset)
  })

  offset = writeUInt32(prefixBuffer, txTmp.locktime, offset)
  offset = writeUInt32(prefixBuffer, txTmp.exprie, offset)
  const witnessBuffer = Buffer.allocUnsafe(sigHashWitnessSerializeSize(txTmp.vin, ourScript))
  witnessBuffer.fill(0)
  offset = 0
  // witness version
  offset = writeUInt16(witnessBuffer, txTmp.version, offset)
  offset = writeUInt16(witnessBuffer, SigHashSerializeWitness, offset)
  // txIns
  offset = writeVarInt(witnessBuffer, txTmp.vin.length, offset)
  txTmp.vin.forEach(function (txIn) {
    offset = writeVarSlice(witnessBuffer, txIn.script, offset)
  })

  // The final signature hash (message to sign) is the hash of the
  // serialization of the following fields:
  //
  // 1) the hash type (as little-endian uint32)
  // 2) prefix hash (as produced by hash function)
  // 3) witness hash (as produced by hash function)
  const typeBuffer = Buffer.allocUnsafe(4)
  typeBuffer.writeUInt32LE(hashType)
  const prefixHash = hash.blake2b256(prefixBuffer)
  const witnessHash = hash.blake2b256(witnessBuffer)
  return hash.blake2b256(Buffer.concat([typeBuffer, prefixHash, witnessHash]))
}
