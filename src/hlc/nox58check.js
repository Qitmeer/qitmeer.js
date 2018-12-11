'use strict'
//hlc
const base58 = require('bs58')
const Buffer = require('safe-buffer').Buffer
const hash = require('./../public/hash')

module.exports = {
    default: Nox58checkBase(hash.dblake2b256),
    Nox58checkdsha256: Nox58checkBase(hash.hash256_btc),
    Nox58checkBase: Nox58checkBase
}

function Nox58checkBase(checksumFn) {
    // Encode a buffer as a base58-check encoded string
    function encode(payload) {
        var checksum = checksumFn(payload)

        return base58.encode(Buffer.concat([
            payload,
            checksum
        ], payload.length + 4))
    }

    function decodeRaw(buffer) {
        let payload = buffer.slice(0, -4)
        let checksum = buffer.slice(-4)
        let newChecksum = checksumFn(payload)

        if (checksum[0] ^ newChecksum[0] |
            checksum[1] ^ newChecksum[1] |
            checksum[2] ^ newChecksum[2] |
            checksum[3] ^ newChecksum[3]) return

        return payload
    }

    function decodeUnsafe(string) {
        let buffer = base58.decodeUnsafe(string)
        if (!buffer) return

        return decodeRaw(buffer)
    }

    function decode(string) {
        let buffer = base58.decode(string)
        let payload = decodeRaw(buffer, checksumFn)
        if (!payload) throw new Error('Invalid checksum')

        return payload
    }

    return {
        encode,
        decode,
        decodeUnsafe
    }
}