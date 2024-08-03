// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

import createHash from "create-hash";
const blakejs = require("blakejs");
const Buffer = require("safe-buffer").Buffer;

function ripemd160(buffer: Buffer): Buffer {
  return Buffer.from(createHash("rmd160").update(buffer).digest());
}

function sha256(buffer: Buffer): Buffer {
  return Buffer.from(createHash("sha256").update(buffer).digest());
}

function bitcoin160(buffer: Buffer): Buffer {
  return ripemd160(sha256(buffer));
}

function dsha256(buffer: Buffer): Buffer {
  return sha256(sha256(buffer));
}

function blake2b256(buffer: Buffer): Buffer {
  return Buffer.from(blakejs.blake2b(buffer, null, 32));
}

function blake2b512(buffer: Buffer): Buffer {
  return Buffer.from(blakejs.blake2b(buffer, null, 64));
}

function hash160(buffer: Buffer): Buffer {
  return ripemd160(blake2b256(buffer));
}

function dblake2b256(buffer: Buffer): Buffer {
  return blake2b256(blake2b256(buffer));
}

export {
  sha256,
  dsha256,
  ripemd160,
  bitcoin160,
  blake2b256,
  blake2b512,
  hash160,
  dblake2b256,
};
