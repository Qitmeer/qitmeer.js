// Copyright 2017-2018 The nox developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const Buffer = require('safe-buffer').Buffer
const nox58check = require('./nox58check').default
const Network = require('./networks')
const Script = require('./script')
const hash = require('./hash')

module.exports = {
  fromBase58Check: fromBase58Check,
  toBase58Check: toBase58Check,
  toOutputScript: toOutputScript,
  ecPubKeyToAddress: ecPubKeyToAddress
}

function fromBase58Check (address) {
  const payload = nox58check.decode(address)

  if (payload.length < 22) throw new TypeError(address + ' is too short')
  if (payload.length > 22) throw new TypeError(address + ' is too long')

  const version = payload.readUInt16BE(0)
  const hash = payload.slice(2)

  return {
    version: version,
    hash: hash
  }
}

/**
 * 公钥生成地址
 * @param {Buffer类型公钥} publicBuffer
 * @param {版本} version
 */
function ecPubKeyToAddress (publicBuffer, version) {
  let v = Buffer.alloc(2)
  v.writeUInt16BE(version, 0)

  const ripeMd160 = hash.rmd160(hash.blake2b256(publicBuffer))
  console.log(ripeMd160.length)
  const concatBuffer = Buffer.concat([v, ripeMd160])

  return nox58check.encode(concatBuffer)
}

/**
 *  hash160公钥 转换地址
 * @param hash  hash160公钥
 * @param version 版本
 * @returns {*|string}
 */
function toBase58Check (hash, version) {
  const payload = Buffer.allocUnsafe(22)
  payload.writeUInt16BE(version, 0)
  hash.copy(payload, 2)

  return nox58check.encode(payload)
}

function toOutputScript (address, network) {
  network = network || Network.privnet
  const decode = fromBase58Check(address)
  if (decode) {
    if (decode.version === network.pubKeyHashAddrId) return Script.Output.P2PKH(decode.hash)
    throw Error('Unknown version ' + decode.version)
  }
  throw Error('fail to base58check decode ' + address)
}
