// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const createHash = require('create-hash')
const blakejs = require('blakejs')
const Buffer = require('safe-buffer').Buffer;
const crypto = require('crypto');

function ripemd160(buffer) {
  return Buffer.from(createHash('rmd160').update(buffer).digest())
}

function sha256(buffer) {
  return Buffer.from(createHash('sha256').update(buffer).digest())
}

function bitcoin160(buffer) {
  return ripemd160(sha256(buffer))
}

function dsha256(buffer) {
  return sha256(sha256(buffer))
}

function blake2b256(buffer) {
  return Buffer.from(blakejs.blake2b(buffer, null, 32))
}

function blake2b512(buffer) {
  return Buffer.from(blakejs.blake2b(buffer, null, 64))
}

function hash160(buffer) {
  return ripemd160(blake2b256(buffer))
}

function dblake2b256(buffer) {
  return blake2b256(blake2b256(buffer))
}

function rmd160(buffer) {
  return crypto.createHash('rmd160').update(buffer).digest();
}

module.exports = {
  sha256: sha256,
  dsha256: dsha256,
  ripemd160: ripemd160,
  bitcoin160: bitcoin160,
  blake2b256: blake2b256,
  blake2b512: blake2b512,
  hash160: hash160,
  dblake2b256: dblake2b256,
  rmd160: rmd160
}
