// Copyright 2017-2018 The qitmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const OPS = require('./ops.json')

var map = {}
for (var op in OPS) {
  var code = OPS[op]
  map[code] = op
}

module.exports = map
