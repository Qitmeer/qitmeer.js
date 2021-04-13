// Copyright 2017-2018 The qitmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const { describe, it } = require('mocha')
const assert = require('assert')
const base58 = require('bs58')
const qitmeer = require('../src')
const data = require('./data/qitmeer.core/core.json')

describe('qitmeer-core', function () {
  // type check
  describe('type check', function () {
    it('hash256', function () {
      const hexStr = '5c0dff371fe9c762139570bdfef7d34aca5e84325871e67fd0203f0da8c5e50c'
      assert.strictEqual(qitmeer.typecheck(qitmeer.types.Hex, hexStr), true)
      assert.strictEqual(qitmeer.typecheck(qitmeer.types.Hex32, hexStr), true)
      assert.strictEqual(qitmeer.typecheck(qitmeer.types.Hash256, Buffer.from(hexStr, 'hex')), true)
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
  describe('qitmeer.hash', function () {
    data.hash.sha256.forEach(function (d) {
      const inputStr = d[0]
      const hashStr = d[1]
      it('sha256 ' + inputStr + ' -> ' + hashStr, function () {
        const hash = qitmeer.hash.sha256(Buffer.from(inputStr, 'hex')).toString('hex')
        assert.strictEqual(hash, hashStr)
      })
    })
    data.hash.blake2b256.forEach(function (d) {
      const inputStr = d[0]
      const hashStr = d[1]
      it('blake2b256 ' + inputStr + ' -> ' + hashStr, function () {
        const hash = qitmeer.hash.blake2b256(Buffer.from(inputStr, 'hex')).toString('hex')
        assert.strictEqual(hash, hashStr)
      })
    })
    data.hash.hash160.forEach(function (d) {
      const inputStr = d[0]
      const hashStr = d[1]
      it('hash160 ' + inputStr + ' -> ' + hashStr, function () {
        const hash = qitmeer.hash.hash160(Buffer.from(inputStr, 'hex')).toString('hex')
        assert.strictEqual(hash, hashStr)
      })
    })
  })
  // base58check
  describe('qitmeer.address', function () {
    data.base58check.forEach(function (f) {
      const hexStr = f[0]
      const qitmeer58checkStr = f[1]
      const coin = f[2].coin
      const net = f[2].network
      if (coin === 'qitmeer') {
        it('fromBase58Checke ' + qitmeer58checkStr, function () {
          const decoded = qitmeer.address.fromBase58Check(qitmeer58checkStr)
          assert.strictEqual(decoded.hash.toString('hex'), hexStr)
          switch (net) {
            case 'privnet':
              assert.strictEqual(decoded.version, qitmeer.networks.privnet.pubKeyHashAddrId)
              break
            case 'mainnet':
              assert.strictEqual(decoded.version, qitmeer.networks.mainnet.pubKeyHashAddrId)
              break
            case 'testnet':
              assert.strictEqual(decoded.version, qitmeer.networks.testnet.pubKeyHashAddrId)
              break
            default :
              assert.fail('unknown network ' + net)
          }
        })
        it('toBase58Check ' + hexStr, function () {
          let encoded
          switch (net) {
            case 'privnet':
              encoded = qitmeer.address.toBase58Check(Buffer.from(hexStr, 'hex'),
                qitmeer.networks.privnet.pubKeyHashAddrId)
              assert.strictEqual(encoded, qitmeer58checkStr)
              break
            case 'mainnet':
              encoded = qitmeer.address.toBase58Check(Buffer.from(hexStr, 'hex'),
                qitmeer.networks.mainnet.pubKeyHashAddrId)
              assert.strictEqual(encoded, qitmeer58checkStr)
              break
            case 'testnet':
              encoded = qitmeer.address.toBase58Check(Buffer.from(hexStr, 'hex'),
                qitmeer.networks.testnet.pubKeyHashAddrId)
              assert.strictEqual(encoded, qitmeer58checkStr)
              break
            default :
              assert.fail('unknown network ' + net)
          }
        })
      }
    })
  })
  describe('qitmeer.EC', function () {
    describe('wif compressed', function () {
      data.EC.wif.compressed.forEach(function (f) {
        const ecPrivStr = f[0]
        const wifStr = f[1]
        const ecPair = qitmeer.ec.fromWIF(wifStr)
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
        const ecPair = qitmeer.ec.fromWIF(wifStr)
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
          const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(privHex, 'hex'))
          assert.strictEqual(keyPair.compressed, true)
          assert.strictEqual(keyPair.privateKey.toString('hex'), privHex)
          assert.strictEqual(keyPair.__priv.toString('hex'), privHex)
          assert.strictEqual(keyPair.publicKey.toString('hex'), pubHex)
          assert.strictEqual(keyPair.__pub.toString('hex'), pubHex)
        })
        it('fromPubKey ' + pubHex, function () {
          const keyPair = qitmeer.ec.fromPublicKey(Buffer.from(pubHex, 'hex'))
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
          const keyPair = qitmeer.ec.fromPrivateKey(Buffer.from(privHex, 'hex'), { compressed: false })
          assert.strictEqual(keyPair.compressed, false)
          assert.strictEqual(keyPair.privateKey.toString('hex'), privHex)
          assert.strictEqual(keyPair.__priv.toString('hex'), privHex)
          assert.strictEqual(keyPair.publicKey.toString('hex'), pubHex)
          assert.strictEqual(keyPair.__pub.toString('hex'), pubHex)
        })
        it('fromPubKey ' + pubHex, function () {
          const keyPair = qitmeer.ec.fromPublicKey(Buffer.from(pubHex, 'hex'), { compressed: false })
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
        const keyPair = qitmeer.ec.fromEntropy()
        assert.strictEqual(true, keyPair.compressed)
        assert.strictEqual(32, keyPair.privateKey.length)
        assert.strictEqual(33, keyPair.publicKey.length)
        assert(keyPair.publicKey[0] === 0x03 || keyPair.publicKey[0] === 0x02)
        const keyPair2 = qitmeer.ec.fromPrivateKey(keyPair.privateKey)
        assert.deepStrictEqual(keyPair2.publicKey, keyPair.publicKey)
      })
    })
    describe('signature', function () {
      it('sign', function () {
        const ecPair = qitmeer.ec.fromWIF('L1g6Qv9Q7H6mraoqLQ4r4pH4up2qfVqzx6y48AoUw1zkke9BnR1F')
        const signature = ecPair.sign(Buffer.from('31d336c0f0fa39bd83e1349549befa279a4e3cf6da3bfcf77578ba078b99476d', 'hex'))
        assert.strictEqual('a62d560012f8a3714b8c85c4282c7498b5490ea8a7e4ab5b392834264574d9d41b445cabb744c6aeeececfcc92cf2effaf2ac177a55cfd6071e41bf45eeb4454', signature.toString('hex'))
      })
      it('verify', function () {
        const ecPair = qitmeer.ec.fromWIF('L1g6Qv9Q7H6mraoqLQ4r4pH4up2qfVqzx6y48AoUw1zkke9BnR1F')
        const result = ecPair.verify(Buffer.from('31d336c0f0fa39bd83e1349549befa279a4e3cf6da3bfcf77578ba078b99476d', 'hex'),
          Buffer.from('a62d560012f8a3714b8c85c4282c7498b5490ea8a7e4ab5b392834264574d9d41b445cabb744c6aeeececfcc92cf2effaf2ac177a55cfd6071e41bf45eeb4454', 'hex'))
        assert.strictEqual(true, result)
      })
    })
  })
  describe('qitmeer.tx', function () {
    describe('nowitness', function () {
      it('fromBuffer', function () {
        // qx tx-encode -i db4d833a87b300f516a3702a3450037dc9fe9febe41a0713d8e626173c8c4c3f:2 -o RmFskNPMcPLn4KpDqYzkgwBoa5soPS2SDDH:440 -o RmQNkCr8ehRUzJhmNmgQVByv7VjakuCjc3d:9.9
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
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
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
        assert.strictEqual(tx.byteLength(), Buffer.from(data.TX.nowitness.hex, 'hex').length)
      })
      it('getTxHash', function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
        assert.deepStrictEqual(tx.toBuffer(), Buffer.from(data.TX.nowitness.hex, 'hex'), 'nowitness')
        assert.deepStrictEqual(tx.getTxIdBuffer().reverse(), Buffer.from(data.TX.nowitness.tx.txid, 'hex'))
      })
      it('getTxId ' + data.TX.nowitness.tx.txid, function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
        assert.strictEqual(tx.getTxId(), data.TX.nowitness.tx.txid)
      })
      it('clone', function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.nowitness.hex, 'hex'))
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
        assert.deepStrictEqual(tx.getTxHash(), txClone.getTxHash())
        assert.strictEqual(tx.getTxId(), txClone.getTxId())
        assert.deepStrictEqual(tx.getTxIdBuffer(), txClone.getTxIdBuffer())
        assert.deepStrictEqual(tx.getTxHashBuffer(), txClone.getTxHashBuffer())
      })
    })
    describe('full witness', function () {
      it('fromBuffer', function () {
        // qx tx-sign -k 9af3b7c0b4f19635f90a5fc722defb961ac43508c66ffe5df992e9314f2a2948 01000000013f4c8c3c1726e6d813071ae4eb9ffec97d0350342a70a316f500b3873a834ddb02000000ffffffff0200b89a3e0a0000001976a91469570a6c1fcb68db1b1c50b34960e714d42c7b9c88ac8033023b000000001976a914c693f8fbfe6836f1fb55579b427cfc4fd201495388ac00000000000000000100
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.strictEqual(tx.version, data.TX.witness.tx.version)
        assert.strictEqual(tx.vin.length, data.TX.witness.tx.vin.length)
        tx.vin.forEach(function (vin, index) {
          assert.strictEqual(vin.txid.reverse().toString('hex'), data.TX.witness.tx.vin[index].txid)
          assert.strictEqual(vin.vout, data.TX.witness.tx.vin[index].vout)
          assert.strictEqual(vin.sequence, data.TX.witness.tx.vin[index].sequence)
          // assert.strictEqual(vin.amountin, data.TX.witness.tx.vin[index].amountin)
          // assert.strictEqual(vin.blockheight, data.TX.witness.tx.vin[index].blockheight)
          // assert.strictEqual(vin.txindex, data.TX.witness.tx.vin[index].txindex)
          assert.deepStrictEqual(vin.script, Buffer.from(data.TX.witness.tx.vin[index].scriptSig.hex, 'hex'))
          assert.strictEqual(107, vin.script.length)
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
        assert.strictEqual(tx.timestamp, data.TX.witness.tx.timestamp)
      })
      it('byteLength', function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.strictEqual(tx.byteLength(), Buffer.from(data.TX.witness.hex, 'hex').length)
      })
      it('getHash', function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.deepStrictEqual(tx.toBuffer(undefined, undefined, qitmeer.tx.TxSerializeWitness), Buffer.from(data.TX.witness.hex, 'hex'))
        assert.deepStrictEqual(tx.getTxIdBuffer().reverse(), Buffer.from(data.TX.witness.tx.txid, 'hex'))
      })
      it('getTxId ' + data.TX.witness.tx.txid, function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.strictEqual(tx.getTxId(), data.TX.witness.tx.txid)
      })
      it('getTxIdBuffer', function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.deepStrictEqual(tx.getTxIdBuffer().reverse(), Buffer.from(data.TX.witness.tx.txid, 'hex'))
      })
      it('getTxHashBuffer' + data.TX.witness.tx.txhash, function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
        assert.deepStrictEqual(tx.getTxHashBuffer().reverse(), Buffer.from(data.TX.witness.tx.txhash, 'hex'))
      })
      it('clone', function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.witness.hex, 'hex'))
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
        assert.deepStrictEqual(tx.getTxHash(), txClone.getTxHash())
        assert.strictEqual(tx.getTxId(), txClone.getTxId())
        assert.deepStrictEqual(tx.getTxIdBuffer(), txClone.getTxIdBuffer())
        assert.deepStrictEqual(tx.getTxHashBuffer(), txClone.getTxHashBuffer())
      })
    })
    describe('two inputs', function () {
      it('fromBuffer/toBuffer', function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.TX.twoinputs.hex, 'hex'))
        assert.strictEqual(tx.vin.length, data.TX.twoinputs.vin.length)
        assert.strictEqual(tx.toBuffer().toString('hex'), data.TX.twoinputs.hex)
      })
    })
    describe('signhash', function () {
      it('hashForSignature, throw invalid index', function () {
        const tx = qitmeer.tx.fromBuffer(Buffer.from(data.SignHashTest[0].txHex, 'hex'))
        const preScript = qitmeer.script.fromBuffer(Buffer.from(data.SignHashTest[0].prvScriptHex, 'hex'))
        assert.throws(function () {
          tx.hashForSignature(1, preScript, qitmeer.tx.SIGHASH_ALL)
        }, /^Error: invalid input index 1, out of the range of tx input 1$/)
      })
      data.SignHashTest.forEach(function (f) {
        it('hashForSignature ' + f.signHash, function () {
          const mytx = qitmeer.tx.fromBuffer(Buffer.from(f.txHex, 'hex'))
          assert.strictEqual(mytx.getTxId(), f.txId)
          const preScript = qitmeer.script.fromBuffer(Buffer.from(f.prvScriptHex, 'hex'))
          assert.strictEqual(preScript.toAsm(), f.prvScriptAsm)
          const signHash = mytx.hashForSignature(0, preScript, qitmeer.tx.SIGHASH_ALL)
          assert.deepStrictEqual(signHash, Buffer.from(f.signHash, 'hex'))
        })
      })
    })
  })
  describe('qitmeer.block', function () {
    describe('test block', function () {
      it('fromBuffer', function () {
        const block = qitmeer.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.strictEqual(block.version, data.Block.json.version)
        assert.strictEqual(block.parentRoot.reverse().toString('hex'), data.Block.json.parentroot)
        assert.strictEqual(block.txRoot.reverse().toString('hex'), data.Block.json.txRoot)
        assert.strictEqual(block.stateRoot.reverse().toString('hex'), data.Block.json.stateRoot)
        assert.strictEqual(block.difficulty, data.Block.json.difficulty)
        // assert.strictEqual(block.height, data.Block.json.height)
        assert.strictEqual(new Date(block.timestamp) * 1000, new Date(data.Block.json.timestamp) * 1000)
        assert.strictEqual(block.pow.nonce, data.Block.json.pow.nonce)
        assert.strictEqual(block.pow.pow_type, data.Block.json.pow.pow_type)
        assert.strictEqual(block.pow.proof_data.edge_bits, data.Block.json.pow.proof_data.edge_bits)
        assert.strictEqual(block.pow.proof_data.circle_nonces.toString('hex'), data.Block.json.pow.proof_data.circle_nonces)
        assert.strictEqual(block.transactions.length, data.Block.json.transactions.length)
        block.transactions.forEach(function (tx, index) {
          assert.strictEqual(tx.version, data.Block.json.transactions[index].version)
          assert.strictEqual(tx.vin.length, data.Block.json.transactions[index].vin.length)
          tx.vin.forEach(function (vin, i) {
            // assert.strictEqual(vin.txid.reverse().toString('hex'), data.Block.json.transactions[index].vin[j].txid)
            // assert.strictEqual(vin.vout, data.Block.json.transactions[index].vin[j].vout)
            assert.strictEqual(vin.sequence, data.Block.json.transactions[index].vin[i].sequence)
            // assert.strictEqual(vin.amountin, data.Block.json.transactions[index].vin[i].amountin)
            // assert.strictEqual(vin.blockheight, data.Block.json.transactions[index].vin[i].blockheight)
            // assert.strictEqual(vin.txindex, data.Block.json.transactions[index].vin[i].txindex)
          })
          assert.strictEqual(tx.vout.length, data.Block.json.transactions[index].vout.length)
          // tx.vout.forEach(function (vout, i) {
          //   assert.strictEqual(vout.amount, data.Block.json.transactions[index].vout[i].amount)
          //   assert.deepStrictEqual(vout.script, Buffer.from(data.Block.json.transactions[index].vout[i].scriptPubKey.hex, 'hex'))
          // })
          assert.strictEqual(tx.locktime, data.Block.json.transactions[index].locktime)
          assert.strictEqual(tx.exprie, data.Block.json.transactions[index].expire)
          assert.strictEqual(tx.byteLength(), Buffer.from(data.Block.json.transactions[index].hex, 'hex').length)
        })
      })
      it('byteLength', function () {
        const block = qitmeer.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.strictEqual(block.byteLength(false), Buffer.from(data.Block.hex, 'hex').length)
      })
      it('toBuffer headeronly', function () {
        const block = qitmeer.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.deepStrictEqual(block.toBuffer(true), Buffer.from(data.BlockHeader.hex, 'hex'))
      })
      it('toBuffer full', function () {
        const block = qitmeer.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.deepStrictEqual(block.toBuffer(false), Buffer.from(data.Block.hex, 'hex'))
      })
      it('getHashBuffer', function () {
        const block = qitmeer.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.deepStrictEqual(block.getHashBuffer(), Buffer.from(data.Block.json.hash, 'hex').reverse())
      })
      it('getHash ' + data.Block.json.hash, function () {
        const block = qitmeer.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        assert.strictEqual(block.getHash(), data.Block.json.hash)
      })
    })
    describe('tx in block', function () {
      const block = qitmeer.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
      block.transactions.forEach(function (tx, index) {
        const txid = data.Block.json.transactions[index].txid
        it('txid ' + txid, function () {
          assert.strictEqual(tx.getTxId(), txid)
        })
        const fullhash = data.Block.json.transactions[index].txhash
        it('txhash ' + fullhash, function () {
          assert.strictEqual(tx.getTxHash(), fullhash)
        })
      })
    })
    describe('txRoot', function () {
      it('calculate txRoot, single tx', function () {
        const block = qitmeer.block.fromBuffer(Buffer.from(data.Block.hex, 'hex'))
        const singleTxInBlock = block.transactions
        assert.strictEqual(1, singleTxInBlock.length)
        // console.log(qitmeer.block.calculateTxRoot(singleTxInBlock).reverse().toString('hex'), data.Block.json.txRoot)
        assert.deepStrictEqual(qitmeer.block.calculateTxRoot(singleTxInBlock), Buffer.from(data.Block.json.txRoot, 'hex').reverse())
      })
      it('calculate txRoot, multi tx', function () {
        const block = qitmeer.block.fromBuffer(Buffer.from(data.BlockMultipleTx.hex, 'hex'))
        const txInBlock = block.transactions
        assert.strictEqual(2, txInBlock.length)
        txInBlock.forEach(function (tx, i) {
          assert.strictEqual(tx.getTxId(), data.BlockMultipleTx.json.transactions[i].txid)
          assert.strictEqual(tx.getTxHash(), data.BlockMultipleTx.json.transactions[i].txhash)
        })
        assert.deepStrictEqual(qitmeer.block.calculateTxRoot(txInBlock), Buffer.from(data.BlockMultipleTx.json.txRoot, 'hex').reverse())
      })
    })
    describe('ops', function () {
      it('test OP_CHECKSIG', function () {
        assert.strictEqual(qitmeer.OPS_MAP[qitmeer.OPS.OP_CHECKSIG], 'OP_CHECKSIG')
        assert.strictEqual(qitmeer.OPS.OP_CHECKSIG, 172)
      })
    })
  })
  describe('qitmeer script', function () {
    describe('fromBuffer ', function () {
      data.ScriptTest.forEach(function (f) {
        const script = qitmeer.script.fromBuffer(Buffer.from(f.hex, 'hex'))
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
        const script = qitmeer.script.fromAsm(f.asm)
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
          const script = qitmeer.script.fromAsm(f.before.asm)
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
      const alex = qitmeer.ec.fromWIF('L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC')
      // create a new tx-signer
      const txsnr = qitmeer.txsign.newSigner()
      txsnr.setVersion(1)
      // alex's previous transaction output, has 450 qitmeer
      txsnr.addInput('5c0dff371fe9c762139570bdfef7d34aca5e84325871e67fd0203f0da8c5e50c', 2)
      txsnr.addOutput('RmFskNPMcPLn4KpDqYzkgwBoa5soPS2SDDH', 44000000000)
      txsnr.addOutput('RmQNkCr8ehRUzJhmNmgQVByv7VjakuCjc3d', 990000000)
      // (in)45000000000 - (out)44990000000 = (miner fee)10000000

      // sign
      txsnr.sign(0, alex)
      // get raw Tx
      const rawTx = txsnr.build().toBuffer()
      // can be broadcast to the qitmeer network
      assert.strictEqual(rawTx.toString('hex'), '01000000010ce5c5a80d3f20d07fe6715832845eca4ad3f7febd70951362c7e91f37ff0d5c02000000ffffffff02000000b89a3e0a0000001976a91469570a6c1fcb68db1b1c50b34960e714d42c7b9c88ac00008033023b000000001976a914c693f8fbfe6836f1fb55579b427cfc4fd201495388ac000000000000000000000000016a4730440220438749b5e955d06da90cdd7c9ec4191e11994022b20cd541376019315ca130c3022035792747edcc60bcd60bf109ef8181f9929aed68139c2348c68333ec36a65d25012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd174')
    })
    it('two inputs of alex', function () {
      // alex's privkey 9af3b7c0b4f19635f90a5fc722defb961ac43508c66ffe5df992e9314f2a2948
      const alex = qitmeer.ec.fromWIF('L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC')
      // create a new tx-signer
      const txsnr = qitmeer.txsign.newSigner()
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

      // can be broadcast to the qitmeer network
      assert.deepStrictEqual(rawTx.toBuffer(), Buffer.from('01000000024d5bc33e3459ed69c0ceeca74813299696f0bde150441fdcb1055aedfc586ad402000000ffffffffdd9f4dcb71296564d79ff5cc2b4a6581e497ea47a1ebb0c92d55efe1d9d3a64602000000ffffffff020000003ad0b8140000001976a91469570a6c1fcb68db1b1c50b34960e714d42c7b9c88ac00008033023b000000001976a914c693f8fbfe6836f1fb55579b427cfc4fd201495388ac000000000000000000000000026b483045022100ed8567dedbc1320c7c60f4097182cbe4cd877c4223f5acd9884d80f5174e9e500220483e91a1506782277023c4eeb72c3585b787b1f619e0d7c5908159d39eb5ba44012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd1746a473044022017b7edfcc331a5df26ccc3f7db557798304ca9a7e4a03d678d0fe88a97b2ef79022043d57a371bbcace977a53016ba9640fcdb88b322ebdef5a9f819172b1b395306012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd174', 'hex'))
    })
    it('issues 17 verify txId', function () {
      const txHex = '0100000001144264e61c55ade29b116aac8b890f2e5286a2135bd7cf7c8ceaa0719609bff000000000ffffffff0268d131217d0000001976a914e101b78c6027cfe0818fe0b1d2f58cc0dacebda588ac1892a31ffb0d00001976a914502ea7fb7e198bcdd3a9d228d38d6c75c179929b88ac0000000000000000da28045f016b483045022100a3b91afbb26b6dbf0a0869d64f6ccdc5d331d567c5002228441c6406574d2a5c02203b8c90879766cc983abca0fd6efae8e605127fe151678d5090b5f9f2b93465790121034212e140d65976ae5da16e8d64216e1db14a73ea6bd6df90aa99eda5ba0ace44'
      const txId = qitmeer.tx.fromBuffer(Buffer.from(txHex, 'hex')).getTxId()
      assert.strictEqual(txId, '2f8c70b01a3e81527e65845050bab8e02b4adac74abd896bf5d18796263c3741')
    })
  })
})
