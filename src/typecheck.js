// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.
const types = require('./types')

module.exports = typecheck

function _getTypeName (fn) { return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1] }

function typecheck (type, value) {
  if (types.Function(type)) {
    if (type(value)) return true
    const tname = _getTypeName(type)
    throw new Error('check type ' + tname + ' failed, invalid value ' + value)
  }
  throw new Error('fail to execute type check : the first argument should be a type function')
}
