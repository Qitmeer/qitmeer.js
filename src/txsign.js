// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.
const Transaction = require('./transaction')
const types = require('./types')
const typecheck = require('./typecheck')
const Script = require('./script')
const SCRIPT_TYPE = Script.types
const addr = require('./address')
const cypto = require('./hash')
const Signature = require('./signature')

module.exports = TxSigner

function TxSigner ( network = Network.privnet ) {
  this.__version = 1
  this.__inputs = []
  this.__network = network
  this.__tx = new Transaction()
}

TxSigner.newSigner = function () {
  return new TxSigner()
}

TxSigner.prototype.setVersion = function (version) {
  typecheck(types.UInt32, version)
  this.__tx.version = version
}

TxSigner.prototype.addInput = function (txHash, vout, options = {} ) {
  typecheck(types.Hex32, txHash)
  typecheck(types.UInt32, vout)

  // transaction hashs's are displayed in reverse order, un-reverse it
  const hash = Buffer.from(txHash, 'hex').reverse()

  // prevOutId '<32bytesHexStr>:<vout>'
  const prevOutId = txHash + ':' + vout

  this.__inputs.forEach(function (input) {
    if (input._prevOutId === prevOutId) { throw new Error('Duplicate TxOut: ' + prevOutId) }
  })

  this.__inputs.push({
    _prevOutId: prevOutId,
    prevOutTx: txHash,
    prevOutIndex: vout,
    prevOutType: (options && options.prevOutType) || SCRIPT_TYPE.P2PKH,
    prevOutScript: options && options.prevOutScript
  })

  this.__tx.addInput( hash, vout, options.sequence )
}

TxSigner.prototype.addOutput = function (address, amount) {
  typecheck(types.Base58, address)
  typecheck(types.Amount, amount)
  const scriptPubKey = addr.toOutputScript(address, this.__network).toBuffer()
  return this.__tx.addOutput(scriptPubKey, amount)
}

TxSigner.prototype.sign = function (vin, keyPair, hashType) {
  // check vin
  const input = this.__inputs[vin]
  if (types.Nil(input)) {
    throw new Error('No input at index: ' + vin)
  }
  // default hashType is SIGHASH_ALL
  hashType = hashType || Transaction.SIGHASH_ALL

  // public key
  const ourPubKey = keyPair.publicKey || keyPair.getPublicKey()

  // build prevOutScript
  if (types.Nil(input.prevOutScript)) {
    const hash = cypto.hash160(ourPubKey)
    input.prevOutScript = Script.Output.P2PKH(hash)
  }
  // signHash
  const signHash = this.__tx.hashForSignature(vin, input.prevOutScript, hashType)
  const signature = keyPair.sign(signHash)

  // signature
  input.signature = Signature.encode(signature, hashType)
  input.pubkey = ourPubKey
}

TxSigner.prototype.build = function () {
  const tx = this.__tx.clone()
  this.__inputs.forEach(function (input, i) {
    tx.setInputScript(i, Script.Input.P2PKH(input.signature, input.pubkey).toBuffer())
  })
  return tx
}


TxSigner.prototype.getId = function () {
  return this.__tx.getId()
}