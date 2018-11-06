// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const { describe, it } = require('mocha')
const assert = require('assert')
const base58 = require('bs58')
const nox = require('../')
const data = require('./data/nox.core/core.json')

describe('Nox-core', function () {
  // type check
  describe('type check', function () {
    it('hash256', function () {
      const hexStr = '5c0dff371fe9c762139570bdfef7d34aca5e84325871e67fd0203f0da8c5e50c'
      assert.strictEqual(nox.typecheck(nox.types.Hex, hexStr), true)
      assert.strictEqual(nox.typecheck(nox.types.Hex32, hexStr), true)
      assert.strictEqual(nox.typecheck(nox.types.Hash256, Buffer.from(hexStr, 'hex')), true)
    })
  })
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
        it('fromPubKey ' + pubHex, function () {
          const keyPair = nox.ec.fromPublicKey(Buffer.from(pubHex, 'hex'))
          assert.strictEqual(keyPair.compressed, true)
          assert.strictEqual(keyPair.privateKey, null)
          assert.strictEqual(keyPair.__priv, null)
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
        it('fromPubKey ' + pubHex, function () {
          const keyPair = nox.ec.fromPublicKey(Buffer.from(pubHex, 'hex'), { 'compressed': false })
          assert.strictEqual(keyPair.compressed, false)
          assert.strictEqual(keyPair.privateKey, null)
          assert.strictEqual(keyPair.__priv, null)
          assert.strictEqual(keyPair.publicKey.toString('hex'), pubHex)
          assert.strictEqual(keyPair.__pub.toString('hex'), pubHex)
        })
      })
    })
    describe('random', function () {
      it('fromEntropy', function () {
        const keyPair = nox.ec.fromEntropy()
        assert.strictEqual(true, keyPair.compressed)
        assert.strictEqual(32, keyPair.privateKey.length)
        assert.strictEqual(33, keyPair.publicKey.length)
        assert(keyPair.publicKey[0] === 0x03 || keyPair.publicKey[0] === 0x02)
        const keyPair2 = nox.ec.fromPrivateKey(keyPair.privateKey)
        assert.deepStrictEqual(keyPair2.publicKey, keyPair.publicKey)
      })
    })
    describe('signature', function () {
      it('sign', function () {
        const ecPair = nox.ec.fromWIF('L1g6Qv9Q7H6mraoqLQ4r4pH4up2qfVqzx6y48AoUw1zkke9BnR1F')
        const signature = ecPair.sign(Buffer.from('31d336c0f0fa39bd83e1349549befa279a4e3cf6da3bfcf77578ba078b99476d', 'hex'))
        assert.strictEqual('a62d560012f8a3714b8c85c4282c7498b5490ea8a7e4ab5b392834264574d9d41b445cabb744c6aeeececfcc92cf2effaf2ac177a55cfd6071e41bf45eeb4454', signature.toString('hex'))
      })
      it('verify', function () {
        const ecPair = nox.ec.fromWIF('L1g6Qv9Q7H6mraoqLQ4r4pH4up2qfVqzx6y48AoUw1zkke9BnR1F')
        const result = ecPair.verify(Buffer.from('31d336c0f0fa39bd83e1349549befa279a4e3cf6da3bfcf77578ba078b99476d', 'hex'),
          Buffer.from('a62d560012f8a3714b8c85c4282c7498b5490ea8a7e4ab5b392834264574d9d41b445cabb744c6aeeececfcc92cf2effaf2ac177a55cfd6071e41bf45eeb4454', 'hex'))
        assert.strictEqual(true, result)
      })
    })
  })
  describe('nox.tx', function () {
    describe('nowitness', function () {
      it('fromBuffer', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
        assert.strictEqual(tx.version, data.TX.nowitness.tx.version)
        assert.strictEqual(tx.vin.length, data.TX.nowitness.tx.vin.length)
        tx.vin.forEach(function (vin, index) {
          assert.strictEqual(vin.txid.reverse().toString('hex'), data.TX.nowitness.tx.vin[index].txid)
          assert.strictEqual(vin.vout, data.TX.nowitness.tx.vin[index].vout)
          assert.strictEqual(vin.sequence, data.TX.nowitness.tx.vin[index].sequence)
          assert.deepStrictEqual(vin.script, Buffer.from(data.TX.nowitness.tx.vin[index].scriptSig.hex, 'hex'))
        })
        assert.strictEqual(tx.vout.length, data.TX.nowitness.tx.vout.length)
        tx.vout.forEach(function (vout, index) {
          assert.strictEqual(vout.amount, data.TX.nowitness.tx.vout[index].amount)
          assert.deepStrictEqual(vout.script, Buffer.from(data.TX.nowitness.tx.vout[index].scriptPubKey.hex, 'hex'))
        })
        assert.strictEqual(tx.locktime, data.TX.nowitness.tx.locktime)
        assert.strictEqual(tx.exprie, data.TX.nowitness.tx.expire)
      })
      it('byteLength', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
        assert.strictEqual(tx.byteLength(), Buffer.from(data.TX.nowitness.hex, 'hex').length)
      })
      it('getHash', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
        assert.deepStrictEqual(tx.toBuffer(undefined, undefined, nox.tx.TxSerializeNoWitness), Buffer.from(data.TX.nowitness.hex, 'hex'))
        assert.deepStrictEqual(tx.getHash().reverse(), Buffer.from(data.TX.nowitness.tx.txid, 'hex'))
      })
      it('getId ' + data.TX.nowitness.tx.txid, function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
        assert.strictEqual(tx.getId(), data.TX.nowitness.tx.txid)
      })
      it('clone', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
        const txClone = tx.clone()
        assert.strictEqual(tx.version, txClone.version)
        assert.strictEqual(tx.vin.length, txClone.vin.length)
        tx.vin.forEach(function (vin, index) {
          assert.strictEqual(vin.txid, txClone.vin[index].txid)
          assert.strictEqual(vin.vout, txClone.vin[index].vout)
          assert.strictEqual(vin.sequence, txClone.vin[index].sequence)
          assert.deepStrictEqual(vin.script, txClone.vin[index].script)
        })
        assert.strictEqual(tx.vout.length, txClone.vout.length)
        tx.vout.forEach(function (vout, index) {
          assert.strictEqual(vout.amount, txClone.vout[index].amount)
          assert.deepStrictEqual(vout.script, txClone.vout[index].script)
        })
        assert.strictEqual(tx.locktime, txClone.locktime)
        assert.strictEqual(tx.exprie, txClone.exprie)
        assert.strictEqual(tx.getId(), txClone.getId())
        assert.deepStrictEqual(tx.getHash(), txClone.getHash())
        assert.strictEqual(tx.getHashFullId(), txClone.getHashFullId())
        assert.deepStrictEqual(tx.getHashFull(), txClone.getHashFull())
      })
    })
    describe('full witness', function () {
      it('fromBuffer', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.strictEqual(tx.version, data.TX.witness.tx.version)
        assert.strictEqual(tx.vin.length, data.TX.witness.tx.vin.length)
        tx.vin.forEach(function (vin, index) {
          assert.strictEqual(vin.txid.reverse().toString('hex'), data.TX.witness.tx.vin[index].txid)
          assert.strictEqual(vin.vout, data.TX.witness.tx.vin[index].vout)
          assert.strictEqual(vin.sequence, data.TX.witness.tx.vin[index].sequence)
          assert.strictEqual(vin.amountin, data.TX.witness.tx.vin[index].amountin)
          assert.strictEqual(vin.blockheight, data.TX.witness.tx.vin[index].blockheight)
          assert.strictEqual(vin.txindex, data.TX.witness.tx.vin[index].txindex)
          assert.deepStrictEqual(vin.script, Buffer.from(data.TX.witness.tx.vin[index].scriptSig.hex, 'hex'))
          assert.strictEqual(106, vin.script.length)
        })
        assert.strictEqual(tx.vout.length, data.TX.witness.tx.vout.length)
        tx.vout.forEach(function (vout, index) {
          assert.strictEqual(vout.amount, data.TX.witness.tx.vout[index].amount)
          assert.deepStrictEqual(vout.script, Buffer.from(data.TX.witness.tx.vout[index].scriptPubKey.hex, 'hex'))
          assert.strictEqual(25, vout.script.length)
          assert.strictEqual(25, Buffer.from(data.TX.witness.tx.vout[index].scriptPubKey.hex, 'hex').length)
        })
        assert.strictEqual(tx.locktime, data.TX.witness.tx.locktime)
        assert.strictEqual(tx.exprie, data.TX.witness.tx.expire)
      })
      it('byteLength', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.strictEqual(tx.byteLength(), Buffer.from(data.TX.witness.hex, 'hex').length)
      })
      it('getHash', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.deepStrictEqual(tx.toBuffer(undefined, undefined, nox.tx.TxSerializeWitness), Buffer.from(data.TX.witness.hex, 'hex'))
        assert.deepStrictEqual(tx.getHash().reverse(), Buffer.from(data.TX.witness.tx.txid, 'hex'))
      })
      it('getId ' + data.TX.witness.tx.txid, function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.strictEqual(tx.getId(), data.TX.witness.tx.txid)
      })
      it('getHashFull ', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.deepStrictEqual(tx.getHashFull().reverse(), Buffer.from(data.TX.witness.tx.txhash, 'hex'))
      })
      it('getHsahFullId ' + data.TX.witness.tx.txhash, function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.strictEqual(tx.getHashFullId(), data.TX.witness.tx.txhash)
      })
      it('clone', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        const txClone = tx.clone()
        assert.strictEqual(tx.version, txClone.version)
        assert.strictEqual(tx.vin.length, txClone.vin.length)
        tx.vin.forEach(function (vin, index) {
          assert.strictEqual(vin.txid, txClone.vin[index].txid)
          assert.strictEqual(vin.vout, txClone.vin[index].vout)
          assert.strictEqual(vin.sequence, txClone.vin[index].sequence)
          assert.deepStrictEqual(vin.script, txClone.vin[index].script)
        })
        assert.strictEqual(tx.vout.length, txClone.vout.length)
        tx.vout.forEach(function (vout, index) {
          assert.strictEqual(vout.amount, txClone.vout[index].amount)
          assert.deepStrictEqual(vout.script, txClone.vout[index].script)
        })
        assert.strictEqual(tx.locktime, txClone.locktime)
        assert.strictEqual(tx.exprie, txClone.exprie)
        assert.strictEqual(tx.getId(), txClone.getId())
        assert.deepStrictEqual(tx.getHash(), txClone.getHash())
        assert.strictEqual(tx.getHashFullId(), txClone.getHashFullId())
        assert.deepStrictEqual(tx.getHashFull(), txClone.getHashFull())
      })
    })
    describe('two inputs', function () {
      it('fromBuffer/toBuffer', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.TX.twoinputs.hex, 'hex'))
        assert.strictEqual(tx.vin.length, data.TX.twoinputs.vin.length)
        assert.strictEqual(tx.toBuffer().toString('hex'), data.TX.twoinputs.hex)
      })
    })
    describe('signhash', function () {
      it('hashForSignature, throw invalid index', function () {
        const tx = nox.tx.fromBuffer(Buffer.from(data.SignHashTest[0].txHex, 'hex'))
        const preScript = nox.script.fromBuffer(Buffer.from(data.SignHashTest[0].prvScriptHex, 'hex'))
        assert.throws(function () {
          tx.hashForSignature(1, preScript, nox.tx.SIGHASH_ALL)
        }, /^Error: invalid input index 1, out of the range of tx input 1$/)
      })
      data.SignHashTest.forEach(function (f) {
        it('hashForSignature ' + f.signHash, function () {
          const mytx = nox.tx.fromBuffer(Buffer.from(f.txHex, 'hex'))
          assert.strictEqual(mytx.getId(), f.txId)
          const preScript = nox.script.fromBuffer(Buffer.from(f.prvScriptHex, 'hex'))
          assert.strictEqual(preScript.toAsm(), f.prvScriptAsm)
          const signHash = mytx.hashForSignature(0, preScript, nox.tx.SIGHASH_ALL)
          assert.deepStrictEqual(signHash, Buffer.from(f.signHash, 'hex'))
        })
      })
    })
  })
  describe('nox.block', function () {
    describe('test block', function () {
      it('fromBuffer', function () {
        const block = nox.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.strictEqual(block.version, data.Block.json.version)
        assert.strictEqual(block.parentRoot.reverse().toString('hex'), data.Block.json.parentHash)
        assert.strictEqual(block.txRoot.reverse().toString('hex'), data.Block.json.txRoot)
        assert.strictEqual(block.stateRoot.reverse().toString('hex'), data.Block.json.stateRoot)
        assert.strictEqual(block.difficulty, data.Block.json.difficulty)
        assert.strictEqual(block.height, data.Block.json.height)
        assert.strictEqual(block.timestamp, Math.round(new Date(data.Block.json.timestamp).getTime() / 1000))
        assert.strictEqual(block.nonce, data.Block.json.nonce)

        assert.strictEqual(block.transactions.length, data.Block.json.transactions.length)
        block.transactions.forEach(function (tx, index) {
          assert.strictEqual(tx.version, data.Block.json.transactions[index].version)
          assert.strictEqual(tx.vin.length, data.Block.json.transactions[index].vin.length)
          tx.vin.forEach(function (vin, i) {
            // assert.strictEqual(vin.txid.reverse().toString('hex'), data.Block.json.transactions[index].vin[j].txid)
            // assert.strictEqual(vin.vout, data.Block.json.transactions[index].vin[j].vout)
            assert.strictEqual(vin.sequence, data.Block.json.transactions[index].vin[i].sequence)
            assert.strictEqual(vin.amountin, data.Block.json.transactions[index].vin[i].amountin)
            assert.strictEqual(vin.blockheight, data.Block.json.transactions[index].vin[i].blockheight)
            assert.strictEqual(vin.txindex, data.Block.json.transactions[index].vin[i].txindex)
          })
          assert.strictEqual(tx.vout.length, data.Block.json.transactions[index].vout.length)
          tx.vout.forEach(function (vout, i) {
            assert.strictEqual(vout.amount, data.Block.json.transactions[index].vout[i].amount)
            assert.deepStrictEqual(vout.script, Buffer.from(data.Block.json.transactions[index].vout[i].scriptPubKey.hex, 'hex'))
          })
          assert.strictEqual(tx.locktime, data.Block.json.transactions[index].locktime)
          assert.strictEqual(tx.exprie, data.Block.json.transactions[index].expire)
          assert.strictEqual(tx.byteLength(), Buffer.from(data.Block.json.transactions[index].hex, 'hex').length)
        })
      })
      it('byteLength', function () {
        const block = nox.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.strictEqual(block.byteLength(false), Buffer.from(data.Block.hex, 'hex').length)
      })
      it('toBuffer headeronly', function () {
        const block = nox.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.deepStrictEqual(block.toBuffer(true), Buffer.from(data.BlockHeader.hex, 'hex'))
      })
      it('toBuffer full', function () {
        const block = nox.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.deepStrictEqual(block.toBuffer(false), Buffer.from(data.Block.hex, 'hex'))
      })
      it('getHash', function () {
        const block = nox.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.deepStrictEqual(block.getHash(), Buffer.from(data.Block.json.hash, 'hex').reverse())
      })
      it('getId ' + data.Block.json.hash, function () {
        const block = nox.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.strictEqual(block.getId(), data.Block.json.hash)
      })
    })
    describe('tx in block', function () {
      const block = nox.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
      block.transactions.forEach(function (tx, index) {
        const txid = data.Block.json.transactions[index].txid
        it('txid ' + txid, function () {
          assert.strictEqual(tx.getId(), txid)
        })
        const fullhash = data.Block.json.transactions[index].txhash
        it('txfullhash ' + fullhash, function () {
          assert.strictEqual(tx.getHashFullId(), fullhash)
        })
      })
    })
    describe('txRoot', function () {
      it('calculate txRoot, single tx', function () {
        const block = nox.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        const singleTxInBlock = block.transactions
        assert.strictEqual(1, singleTxInBlock.length)
        assert.deepStrictEqual(nox.block.calculateTxRoot(singleTxInBlock), Buffer.from(data.Block.json.txRoot, 'hex').reverse())
      })
      it('calculate txRoot, multi tx', function () {
        const block = nox.block.fromBuffer(Buffer.from(data.BlockMultipleTx.hex, 'hex'))
        const txInBlock = block.transactions
        assert.strictEqual(3, txInBlock.length)
        txInBlock.forEach(function (tx, i) {
          assert.strictEqual(tx.getId(), data.BlockMultipleTx.json.transactions[i].txid)
          assert.strictEqual(tx.getHashFullId(), data.BlockMultipleTx.json.transactions[i].txhash)
        })
        assert.deepStrictEqual(nox.block.calculateTxRoot(txInBlock), Buffer.from(data.BlockMultipleTx.json.txRoot, 'hex').reverse())
      })
    })
    describe('ops', function () {
      it('test OP_CHECKSIG', function () {
        assert.strictEqual(nox.OPS_MAP[nox.OPS.OP_CHECKSIG], 'OP_CHECKSIG')
        assert.strictEqual(nox.OPS.OP_CHECKSIG, 172)
      })
    })
  })
  describe('nox script', function () {
    describe('fromBuffer ', function () {
      data.ScriptTest.forEach(function (f) {
        const script = nox.script.fromBuffer(Buffer.from(f.hex, 'hex'))
        it('test script toAsm ' + f.asm, function () {
          assert.strictEqual(f.asm, script.toAsm())
        })
        it('test script toBuffer ' + f.hex, function () {
          assert.deepStrictEqual(Buffer.from(f.hex, 'hex'), script.toBuffer())
        })
      })
    })
    describe('fromAsm ', function () {
      data.ScriptTest.forEach(function (f) {
        const script = nox.script.fromAsm(f.asm)
        it('test script toAsm ' + f.asm, function () {
          assert.strictEqual(f.asm, script.toAsm())
        })
        it('test script toBuffer ' + f.hex, function () {
          assert.deepStrictEqual(Buffer.from(f.hex, 'hex'), script.toBuffer())
        })
      })
    })
    describe('removeCodeSeparator ', function () {
      data.ScriptRemoveTest.forEach(function (f) {
        it('test script ' + f.before.hex + '->' + f.after.hex, function () {
          const script = nox.script.fromAsm(f.before.asm)
          assert.strictEqual(f.before.asm, script.toAsm())
          assert.strictEqual(script.removeCodeSeparator().toAsm(), f.after.asm)
          assert.strictEqual(script.removeCodeSeparator().toBuffer().toString('hex'),
            f.after.hex)
        })
      })
    })
  })
  describe('example', function () {
    it('sign a raw transaction', function () {
      // alex's privkey 9af3b7c0b4f19635f90a5fc722defb961ac43508c66ffe5df992e9314f2a2948
      const alex = nox.ec.fromWIF('L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC')
      // create a new tx-signer
      const txsnr = nox.txsign.newSigner()
      txsnr.setVersion(1)
      // alex's previous transaction output, has 450 nox
      txsnr.addInput('5c0dff371fe9c762139570bdfef7d34aca5e84325871e67fd0203f0da8c5e50c', 2)
      txsnr.addOutput('RmFskNPMcPLn4KpDqYzkgwBoa5soPS2SDDH', 44000000000)
      txsnr.addOutput('RmQNkCr8ehRUzJhmNmgQVByv7VjakuCjc3d', 990000000)
      // (in)45000000000 - (out)44990000000 = (miner fee)10000000

      // sign
      txsnr.sign(0, alex)
      // get raw Tx
      const rawTx = txsnr.build().toBuffer()
      // can be broadcast to the nox network
      assert.strictEqual(rawTx.toString('hex'), '01000000010ce5c5a80d3f20d07fe6715832845eca4ad3f7febd70951362c7e91f37ff0d5c02000000ffffffff0200b89a3e0a0000001976a91469570a6c1fcb68db1b1c50b34960e714d42c7b9c88ac8033023b000000001976a914c693f8fbfe6836f1fb55579b427cfc4fd201495388ac000000000000000001000000000000000000000000000000006a473044022061e957624fc53e9be6217845ed9c7251c04de33fd5143dab84e73c27193effe40220231ba5e6365277af20d41e8e08413147247070b7022f0cbbe9cbb35dc16e24d8012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd174')
    })
    it('two inputs of alex', function () {
      // alex's privkey 9af3b7c0b4f19635f90a5fc722defb961ac43508c66ffe5df992e9314f2a2948
      const alex = nox.ec.fromWIF('L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC')
      // create a new tx-signer
      const txsnr = nox.txsign.newSigner()
      txsnr.setVersion(1)
      txsnr.addInput('d46a58fced5a05b1dc1f4450e1bdf09696291348a7eccec069ed59343ec35b4d', 2)
      txsnr.addInput('46a6d3d9e1ef552dc9b0eba147ea97e481654a2bccf59fd764652971cb4d9fdd', 2)
      txsnr.addOutput('RmFskNPMcPLn4KpDqYzkgwBoa5soPS2SDDH', 89000000000)
      txsnr.addOutput('RmQNkCr8ehRUzJhmNmgQVByv7VjakuCjc3d', 990000000)
      // (in)90000000000 - (out)89990000000 = (miner fee)10000000
      // sign all index
      txsnr.sign(0, alex)
      txsnr.sign(1, alex)
      // get raw Tx
      const rawTx = txsnr.build()

      // can be broadcast to the nox network
      assert.deepStrictEqual(rawTx.toBuffer(), Buffer.from('01000000024d5bc33e3459ed69c0ceeca74813299696f0bde150441fdcb1055aedfc586ad402000000ffffffffdd9f4dcb71296564d79ff5cc2b4a6581e497ea47a1ebb0c92d55efe1d9d3a64602000000ffffffff02003ad0b8140000001976a91469570a6c1fcb68db1b1c50b34960e714d42c7b9c88ac8033023b000000001976a914c693f8fbfe6836f1fb55579b427cfc4fd201495388ac000000000000000002000000000000000000000000000000006a473044022005422cf4f7a082fe931509b44aee54c3d3c80b1f0d43ed1483ffeb7248857fe402202b9c050ed0fbb9883c8ff98d8a48c33483b32ad776d6746365f9b8851e6dcda5012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd174000000000000000000000000000000006b483045022100be434e16f4c83947b1a19fefbf319b7170b280c9a0d89c0786624a83bda337910220395753153ab55b21d7041705c75f42778d7846a41ca5cbb5b033f875d20a9f15012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd174', 'hex'))
    })
  })
})
