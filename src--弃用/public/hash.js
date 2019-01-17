const createHash = require('create-hash')
const blakejs = require('blakejs')
const Buffer = require('safe-buffer').Buffer
const crypto = require('crypto')


module.exports = {
    sha256,
    hash256_btc,
    ripemd160,
    hash160_btc,
    hash160_hlc,
    blake2b256,
    blake2b512,
    dblake2b256,
    rmd160
}

function ripemd160(buffer) {
    return Buffer.from(createHash('rmd160').update(buffer).digest())
}

function sha256(buffer) {
    return Buffer.from(createHash('sha256').update(buffer).digest())
}

function blake2b256(buffer) {
    return Buffer.from(blakejs.blake2b(buffer, null, 32))
}

function hash160_btc(buffer) {
    return ripemd160(sha256(buffer))
}

function hash160_hlc(buffer) {
    return ripemd160(blake2b256(buffer))
}

function hash256_btc(buffer) {
    return sha256(sha256(buffer))
}

function blake2b512(buffer) {
    return Buffer.from(blakejs.blake2b(buffer, null, 64))
}

function dblake2b256(buffer) {
    return blake2b256(blake2b256(buffer))
}

function rmd160(buffer) {
    return crypto.createHash('rmd160').update(buffer).digest()
}