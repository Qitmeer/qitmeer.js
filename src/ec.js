// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const secp256k1 = require('tiny-secp256k1')
const randomBytes = require('randombytes')
const wif = require('./wif')

const networks = require('./networks')

module.exports = {
  fromEntropy,
  fromPrivateKey,
  fromPublicKey,
  fromWIF
}

function EC (priv, pub, options) {
  options = options || {}

  this.compressed = options.compressed === undefined ? true : options.compressed
  this.network = options.network || networks.privnet

  this.__priv = priv || null
  this.__pub = null
  if (pub) this.__pub = secp256k1.pointCompress(pub, this.compressed)
}

Object.defineProperty(EC.prototype, 'privateKey', {
  enumerable: false,
  get: function () { return this.__priv }
})

Object.defineProperty(EC.prototype, 'publicKey', {
  get: function () {
    if (!this.__pub) this.__pub = secp256k1.pointFromScalar(this.__priv, this.compressed)
    return this.__pub
  }
})

EC.prototype.toWIF = function () {
  if (!this.__priv) throw new Error('Missing private key')
  return wif.encode(this.__priv, this.compressed)
}

EC.prototype.sign = function (hash) {
  if (!this.__priv) throw new Error('Missing private key')
  return secp256k1.sign(hash, this.__priv)
}

EC.prototype.verify = function (hash, signature) {
  return secp256k1.verify(hash, this.publicKey, signature)
}

function fromEntropy (options) {
  options = options || {}
  const rng = options.rng || randomBytes
  let x
  do {
    x = rng(32)
  } while (!secp256k1.isPrivate(x))

  return fromPrivateKey(x, options)
}

function fromPrivateKey (buffer, options) {
  if (!secp256k1.isPrivate(buffer)) throw new TypeError('Private key not in range [1, n)')
  return new EC(buffer, null, options)
}

function fromPublicKey (buffer, options) {
  return new EC(null, buffer, options)
}

function fromWIF (string) {
  const decoded = wif.decode(string)
  return fromPrivateKey(decoded.privateKey, {
    compressed: decoded.compressed
  })
}
