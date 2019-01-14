// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const nox58check = require('./nox58check').Nox58checkdsha256;
const types = require('./types');

function decodeRaw (buffer, version) {
    // check version only if defined
    if (version !== undefined && buffer[0] !== version) throw new Error('Invalid network version');

    // uncompressed
    if (buffer.length === 33) {
        return {
            version: buffer[0],
            privateKey: buffer.slice(1, 33),
            compressed: false
        }
    }

    // invalid length
    if (buffer.length !== 34) throw new Error('Invalid WIF length');

    // invalid compression flag
    if (buffer[33] !== 0x01) throw new Error('Invalid compression flag');

    return {
        version: buffer[0],
        privateKey: buffer.slice(1, 33),
        compressed: true
    }
}

function encodeRaw (privateKey, compressed, version) {
    var result = Buffer.alloc(compressed ? 34 : 33);
    if (types.Nil(version)) {
        version = 0x80
    }
    result.writeUInt8(version, 0);
    privateKey.copy(result, 1);

    if (compressed) {
        result[33] = 0x01
    }

    return result
}

function decode (string, version) {
    if (types.Nil(version)) version = 0x80;
    return decodeRaw(nox58check.decode(string), version)
}

function encode (privateKey, compressed, version) {
    return nox58check.encode(encodeRaw(privateKey, compressed, version))
}

module.exports = {
    decode: decode,
    decodeRaw: decodeRaw,
    encode: encode,
    encodeRaw: encodeRaw
};
