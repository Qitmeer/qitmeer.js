// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const OPS = require('./ops.json')

const map = {}
for (const op in OPS) {
  const code = OPS[op]
  map[code] = op
}

module.exports = map
