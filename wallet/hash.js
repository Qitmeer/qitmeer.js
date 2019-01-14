const crypto = require('crypto');
const blakejs = require('blakejs');

module.exports = {
    sha256,
    sha256B,
    rmd160,
    rmd160B,
    rmd160B_sha256B,
    blake2b256,
    blake2b256B,
    blake2b512,
    blake2b512B,
    dblake2b256B,
    dsha256B,
    rmd160B_blake2b256B
};

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest()
}

function sha256B(buffer) {
    return Buffer.from(crypto.createHash('sha256').update(buffer).digest())
}

function rmd160(buffer) {
    return crypto.createHash('rmd160').update(buffer).digest()
}

function rmd160B(buffer) {
    return Buffer.from(crypto.createHash('rmd160').update(buffer).digest())
}

function blake2b256(buffer) {
    return blakejs.blake2b(buffer, null, 32)
}

function blake2b256B(buffer) {
    return Buffer.from(blakejs.blake2b(buffer, null, 32))
}

function blake2b512(buffer) {
    return blakejs.blake2b(buffer, null, 64)
}

function blake2b512B(buffer) {
    return Buffer.from(blakejs.blake2b(buffer, null, 64))
}

function dsha256B(buffer) {
    return sha256B(sha256B(buffer))
}

function dblake2b256B(buffer) {
    return blake2b256B(blake2b256B(buffer))
}

function rmd160B_sha256B(buffer) {
    return rmd160B(sha256B(buffer))
}

function rmd160B_blake2b256B(buffer) {
    return rmd160B(blake2b256B(buffer))
}