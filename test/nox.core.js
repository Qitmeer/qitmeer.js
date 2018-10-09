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
      const mode = f[2].mode
      if (mode === 'nox') {
        it('nox base58check decode ' + nox58checkStr, function () {
          const decoded = nox.address.fromBase58Check(nox58checkStr)
          assert.strictEqual(decoded.hash.toString('hex'), hexStr)
        })
      }
    })
  })
})
