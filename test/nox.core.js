// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const { describe, it } = require('mocha')
const assert = require('assert')
const base58 = require('bs58')
const nox = require('../')
const data = require('./data/nox.core/core.json')

describe('Nox-core', function () {
  // base58
  describe('base58', function () {
    data.base58.forEach(function (f) {
      const hexStr = f[0]
      const b58Str = f[1]
      it('encode ' + hexStr + ' -> ' + b58Str, function () {
        const encoded = base58.encode(Buffer.from(hexStr, 'hex')).toString('hex')
        assert.strictEqual(encoded, b58Str)
      })
      it('decode ' + b58Str + ' -> ' + hexStr, function () {
        const decoded = base58.decode(b58Str).toString('hex')
        assert.strictEqual(decoded, hexStr)
      })
    })
  })
  // hash
  describe('nox.hash', function () {
    data.hash.sha256.forEach(function (d) {
      const inputStr = d[0]
      const hashStr = d[1]
      it('sha256 ' + inputStr + ' -> ' + hashStr, function () {
        const hash = nox.hash.sha256(Buffer.from(inputStr, 'hex')).toString('hex')
        assert.strictEqual(hash, hashStr)
      })
    })
    data.hash.blake2b256.forEach(function (d) {
      const inputStr = d[0]
      const hashStr = d[1]
      it('blake2b256 ' + inputStr + ' -> ' + hashStr, function () {
        const hash = nox.hash.blake2b256(Buffer.from(inputStr, 'hex')).toString('hex')
        assert.strictEqual(hash, hashStr)
      })
    })
    data.hash.hash160.forEach(function (d) {
      const inputStr = d[0]
      const hashStr = d[1]
      it('hash160 ' + inputStr + ' -> ' + hashStr, function () {
        const hash = nox.hash.hash160(Buffer.from(inputStr, 'hex')).toString('hex')
        assert.strictEqual(hash, hashStr)
      })
    })
  })
  // base58check
  describe('nox.address', function () {
    data.base58check.forEach(function (f) {
      const hexStr = f[0]
      const nox58checkStr = f[1]
      const coin = f[2].coin
      const net = f[2].network
      if (coin === 'nox') {
        it('fromBase58Checke ' + nox58checkStr, function () {
          const decoded = nox.address.fromBase58Check(nox58checkStr)
          assert.strictEqual(decoded.hash.toString('hex'), hexStr)
          switch (net) {
            case 'privnet':
              assert.strictEqual(decoded.version, nox.networks.privnet.pubKeyHashAddrId)
              break
            case 'mainnet':
              assert.strictEqual(decoded.version, nox.networks.mainnet.pubKeyHashAddrId)
              break
            case 'testnet':
              assert.strictEqual(decoded.version, nox.networks.testnet.pubKeyHashAddrId)
              break
            default :
              assert.fail('unknown network ' + net)
          }
        })
        it('toBase58Check ' + hexStr, function () {
          let encoded
          switch (net) {
            case 'privnet':
              encoded = nox.address.toBase58Check(Buffer.from(hexStr, 'hex'),
                nox.networks.privnet.pubKeyHashAddrId)
              assert.strictEqual(encoded, nox58checkStr)
              break
            case 'mainnet':
              encoded = nox.address.toBase58Check(Buffer.from(hexStr, 'hex'),
                nox.networks.mainnet.pubKeyHashAddrId)
              assert.strictEqual(encoded, nox58checkStr)
              break
            case 'testnet':
              encoded = nox.address.toBase58Check(Buffer.from(hexStr, 'hex'),
                nox.networks.testnet.pubKeyHashAddrId)
              assert.strictEqual(encoded, nox58checkStr)
              break
            default :
              assert.fail('unknown network ' + net)
          }
        })
      }
    })
  })
  describe('nox.EC', function () {
    describe('wif compressed', function () {
      data.EC.wif.compressed.forEach(function (f) {
        const ecPrivStr = f[0]
        const wifStr = f[1]
        const ecPair = nox.ec.fromWIF(wifStr)
        it('fromWIF ' + wifStr, function () {
          assert.strictEqual(ecPrivStr, Buffer.from(ecPair.privateKey).toString('hex'))
          assert.strictEqual(true, ecPair.compressed)
        })
        it('toWIF ' + ecPrivStr, function () {
          const wif = ecPair.toWIF()
          assert.strictEqual(wifStr, wif)
        })
      })
    })
    describe('wif uncompressed', function () {
      data.EC.wif.uncompressed.forEach(function (f) {
        const ecPrivStr = f[0]
        const wifStr = f[1]
        const ecPair = nox.ec.fromWIF(wifStr)
        it('fromWIF ' + wifStr, function () {
          assert.strictEqual(ecPrivStr, Buffer.from(ecPair.privateKey).toString('hex'))
          assert.strictEqual(false, ecPair.compressed)
        })
        it('toWIF ' + ecPrivStr, function () {
          const wif = ecPair.toWIF()
          assert.strictEqual(wifStr, wif)
        })
      })
    })
    describe('keypair compressed', function () {
      data.EC.keypair.compressed.forEach(function (f) {
        const privHex = f[0]
        const pubHex = f[1]
        it('fromPrivateKey ' + privHex, function () {
          const keyPair = nox.ec.fromPrivateKey(Buffer.from(privHex, 'hex'))
          assert.strictEqual(keyPair.compressed, true)
          assert.strictEqual(keyPair.privateKey.toString('hex'), privHex)
          assert.strictEqual(keyPair.__priv.toString('hex'), privHex)
          assert.strictEqual(keyPair.publicKey.toString('hex'), pubHex)
          assert.strictEqual(keyPair.__pub.toString('hex'), pubHex)
        })
      })
    })
    describe('keypair uncompressed', function () {
      data.EC.keypair.uncompressed.forEach(function (f) {
        const privHex = f[0]
        const pubHex = f[1]
        it('fromPrivateKey ' + privHex, function () {
          const keyPair = nox.ec.fromPrivateKey(Buffer.from(privHex, 'hex'), { 'compressed': false })
          assert.strictEqual(keyPair.compressed, false)
          assert.strictEqual(keyPair.privateKey.toString('hex'), privHex)
          assert.strictEqual(keyPair.__priv.toString('hex'), privHex)
          assert.strictEqual(keyPair.publicKey.toString('hex'), pubHex)
          assert.strictEqual(keyPair.__pub.toString('hex'), pubHex)
        })
      })
    })
  })
})
