//hlc

const Buffer = require('safe-buffer').Buffer
const OPS = require('./ops/ops.json')
const OPS_MAP = require('./ops/map')
const utils = require('./ops/utils')

module.exports = Script;


function Script() {
    this.version = 1
    this.stack = []
}

Script.types = {
    NONSTANDARD: 'nonstandard',
    NULLDATA: 'nulldata',
    P2PK: 'pubkey',
    P2PKH: 'pubkeyhash',
    P2SH: 'scripthash'
}

const __publicKeyScript = (hash) => {
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

const __signatureScript = (signature, pubkey) => {
    const script = new Script()
    script.stack = [
        signature,
        pubkey
    ]
    return script
}

Script.Output = {
    P2PKH: __publicKeyScript
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
    const bufferSize = this.stack.reduce(function (accum, chunk) {
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

    this.stack.forEach(function (chunk) {
        // data chunk
        if (Buffer.isBuffer(chunk)) {
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
    })

    if (offset !== buffer.length) throw new Error('Could not decode chunks')
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

