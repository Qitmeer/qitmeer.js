// Copyright 2017-2018 The qitmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

function _LengthN (type, l) {
  function length (value) {
    if (!type(value)) return false
    if (value.length === l) return true
  }
  return length
}

function _Buffer (value) {
  return Buffer.isBuffer(value)
}
const _BufferN = _LengthN.bind(null, _Buffer)

function _Hex (value) {
  return typeof value === 'string' && /^([0-9a-f]{2})+$/i.test(value)
}

function _Base58 (value) {
  return typeof value === 'string' && /^([123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{1})+$/.test(value)
}

const _HexN = _LengthN.bind(null, _Hex)

const _UINT53_MAX = Math.pow(2, 53) - 1
function _UInt53 (value) {
  return typeof value === 'number' &&
    value >= 0 &&
    value <= _UINT53_MAX &&
    Math.floor(value) === value
}

const AMOUNT_MAX = 21 * 1e14
function _Amount (value) {
  return _UInt53(value) && value <= AMOUNT_MAX
}

const COIN_IDS = {
  MEER: 0,
  QITID: 1
}
function _CoinId(coinName) {
  return COIN_IDS[coinName]
}

var types = {
  Array: function (value) { return value !== null && value !== undefined && value.constructor === Array },
  Boolean: function (value) { return typeof value === 'boolean' },
  Function: function (value) { return typeof value === 'function' },
  Nil: function (value) { return value === undefined || value === null },
  Number: function (value) { return typeof value === 'number' },
  Object: function (value) { return typeof value === 'object' },
  String: function (value) { return typeof value === 'string' },
  '': function () { return true },
  Int8: function (value) { return ((value << 24) >> 24) === value },
  Int16: function (value) { return ((value << 16) >> 16) === value },
  Int32: function (value) { return (value | 0) === value },
  UInt8: function (value) { return (value & 0xff) === value },
  UInt16: function (value) { return (value & 0xffff) === value },
  UInt32: function (value) { return (value >>> 0) === value },
  Buffer: _Buffer,
  BufferN: _BufferN,
  Hex: _Hex,
  Hex32: _HexN(64),
  Hex20: _HexN(40),
  Hash256: _BufferN(32),
  Hash160: _BufferN(20),
  Amount: _Amount,
  Base58: _Base58,
  CoinId: _CoinId
}

module.exports = types
