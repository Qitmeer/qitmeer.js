// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const { describe, it } = require('mocha')
const assert = require('assert')
const base58 = require('bs58')
const nox = require('../')
const data = require('./data/nox.core/base58.json')

describe('Nox-core', function () {
  // base58
  describe('base58', function () {
    data.base58.forEach(function (f) {
      const hexStr = f[0]
      const b58Str = f[1]
      it('base58 encode ' + hexStr + ' -> ' + b58Str, function () {
        const encoded = base58.encode(Buffer.from(hexStr, 'hex')).toString('hex')
        assert.strictEqual(encoded, b58Str)
      })
      it('base58 decode ' + b58Str + ' -> ' + hexStr, function () {
        const decoded = base58.decode(b58Str).toString('hex')
        assert.strictEqual(decoded, hexStr)
      })
    })
  })
  // base58check
  describe('nox base58check', function () {
    data.base58check.forEach(function (f) {
      const hexStr = f[0]
      const nox58checkStr = f[1]
      const coin = f[2].coin
      const net = f[2].network
      if (coin === 'nox') {
        it('nox base58check decode ' + nox58checkStr, function () {
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
        it('nox base58check encode ' + hexStr, function () {
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
})
