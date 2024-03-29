// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const Buffer = require('safe-buffer').Buffer
const OPS = require('./ops/ops.json')
const OPS_MAP = require('./ops/map')
const utils = require('./ops/utils')

module.exports = Script

function Script () {
  this.version = 1 // not used, reversed
  this.stack = []
}

Script.types = {
  NONSTANDARD: 'nonstandard',
  NULLDATA: 'nulldata',
  P2PK: 'pubkey',
  P2PKH: 'pubkeyhash',
  P2SH: 'scripthash'
}

const __publicKeyScript = function (hash) {
  const script = new Script()
  script.stack = [
    OPS.OP_DUP,
    OPS.OP_HASH160,
    hash,
    OPS.OP_EQUALVERIFY,
    OPS.OP_CHECKSIG
  ]
  return script
}

// Lock script
const __cltvScript = function (hash, lockTime) {
  const script = new Script()
  script.stack = [
    'cltv',
    lockTime,
    OPS.OP_CHECKLOCKTIMEVERIFY,
    OPS.OP_DROP,
    OPS.OP_DUP,
    OPS.OP_HASH160,
    hash,
    OPS.OP_EQUALVERIFY,
    OPS.OP_CHECKSIG
  ]
  return script
}

const __scriptHash = function (hash) {
  const script = new Script()
  script.stack = [
    OPS.OP_HASH160,
    hash,
    OPS.OP_EQUAL
  ]
  return script
}

const __signatureScript = function (signature, pubkey) {
  const script = new Script()
  script.stack = [
    signature,
    pubkey
  ]
  return script
}

Script.Output = {
  P2PKH: __publicKeyScript,
  CLTV: __cltvScript,
  P2SH: __scriptHash
}

Script.Input = {
  P2PKH: __signatureScript,
  P2PK: __signatureScript
}

Script.fromBuffer = function (buffer) {
  const script = new Script()
  if (Buffer.isBuffer(buffer)) {
    let i = 0
    while (i < buffer.length) {
      const opcode = buffer[i]
      // data chunk
      if ((opcode > OPS.OP_0) && (opcode <= OPS.OP_PUSHDATA4)) {
        const d = utils.decode(buffer, i)

        // did reading a pushDataInt fail?
        if (d === null) return null
        i += d.size

        // attempt to read too much data?
        if (i + d.number > buffer.length) return null

        const data = buffer.slice(i, i + d.number)
        i += d.number

        // decompile minimally
        const op = utils.asMinimalOP(data)
        if (op !== undefined) {
          script.stack.push(op)
        } else {
          script.stack.push(data)
        }

        // opcode
      } else {
        script.stack.push(opcode)
        i += 1
      }
    }
  }
  return script
}

Script.fromAsm = function (asm) {
  const script = new Script()
  script.stack = (asm.split(' ').map(function (chunkStr) {
    // opcode?
    if (OPS[chunkStr] !== undefined) return OPS[chunkStr]
    // data!
    return Buffer.from(chunkStr, 'hex')
  }))
  return script
}

Script.prototype.toAsm = function () {
  return this.stack.map(function (chunk) {
    // data?
    if (Buffer.isBuffer(chunk)) {
      const op = utils.asMinimalOP(chunk)
      if (op === undefined) return chunk.toString('hex')
      chunk = op
    }
    // opcode!
    return OPS_MAP[chunk]
  }).join(' ')
}

Script.prototype.toBuffer = function () {
  let lockIndex
  const bufferSize = this.stack.reduce(function (accum, chunk, i) {
    if (typeof chunk === 'string' && chunk === 'cltv') {
      lockIndex = 1
      return accum
    }
    if (typeof lockIndex === 'number' && lockIndex === i) {
      if (chunk === 0) {
        return accum + 1
      } else if (chunk >= 1 && chunk <= 16) {
        return accum + 1
      } else {
        const result = Buffer.alloc(9)
        while (chunk > 0) {
          result.writeUInt8(chunk & 0xff)
          chunk >>= 8
          accum += 1
        }
        if ((result[accum - 1] & 0x80) !== 0) {
          accum += 1
        }
        return accum + 1
      }
    }
    // data chunk
    if (Buffer.isBuffer(chunk)) {
      // adhere to BIP62.3, minimal push policy
      if (chunk.length === 1 && utils.asMinimalOP(chunk) !== undefined) {
        return accum + 1
      }

      return accum + utils.encodingLength(chunk.length) + chunk.length
    }

    // opcode
    return accum + 1
  }, 0.0)
  const buffer = Buffer.allocUnsafe(bufferSize)
  let offset = 0

  this.stack.forEach(function (chunk, index) {
    // Judge whether it is locked or not
    if (typeof chunk === 'string' && chunk === 'cltv') return
    // Lock execution
    if (typeof lockIndex === 'number' && lockIndex === index) {
      if (chunk === 0) {
        buffer.writeUInt8(OPS.OP_0, offset)
        offset += 1
      } else if (chunk >= 1 && chunk <= 16) {
        buffer.writeUInt8(OPS.OP_1 - 1 + chunk, offset)
        offset += 1
      } else {
        let dataLen = 0
        const data = Buffer.alloc(12)
        let n = chunk
        while (n > 0) {
          data.writeUInt8(n & 0xff, dataLen)
          n >>= 8
          dataLen++
        }
        if ((data[dataLen - 1] & 0x80) !== 0) {
          dataLen++
        }

        buffer.writeUInt8(dataLen, offset)
        offset++
        console.log(`${offset} - ${chunk}`, buffer)
        while (chunk > 0) {
          buffer.writeUInt8(chunk & 0xff, offset)
          chunk >>= 8
          offset += 1
        }
        if ((buffer[offset - 1] & 0x80) !== 0) {
          buffer.writeUInt8(0x00, offset)
          offset += 1
        }
      }
    } else if (Buffer.isBuffer(chunk)) {
      // adhere to BIP62.3, minimal push policy
      const opcode = utils.asMinimalOP(chunk)
      if (opcode !== undefined) {
        buffer.writeUInt8(opcode, offset)
        offset += 1
        return
      }

      offset += utils.encode(buffer, chunk.length, offset)
      chunk.copy(buffer, offset)
      offset += chunk.length

      // opcode
    } else {
      buffer.writeUInt8(chunk, offset)
      offset += 1
    }
    console.log('buffer', buffer)
  })

  if (offset !== buffer.length) throw new Error('Could not decode chunks')
  console.log('buffer', buffer)
  return buffer
}

Script.prototype.removeOP = function (op) {
  this.stack = this.stack.filter(function (x) {
    return x !== op
  })
  return this
}

Script.prototype.removeCodeSeparator = function () {
  this.removeOP(OPS.OP_CODESEPARATOR)
  return this
}
