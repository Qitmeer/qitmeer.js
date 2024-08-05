// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.
import { sha256 as hsha256 } from "@noble/hashes/sha256"; // ECMAScript modules (ESM) and Common.js
import { ripemd160 as rmd160 } from "@noble/hashes/ripemd160";
import { blake2b } from "@noble/hashes/blake2b";

function ripemd160(buffer: Uint8Array): Uint8Array {
  return rmd160(buffer);
}

function sha256(buffer: Uint8Array): Uint8Array {
  return hsha256(buffer);
}

function bitcoin160(buffer: Uint8Array): Uint8Array {
  return ripemd160(sha256(buffer));
}

function dsha256(buffer: Uint8Array): Uint8Array {
  return sha256(sha256(buffer));
}

function blake2b256(buffer: Uint8Array): Uint8Array {
  return blake2b(buffer, { dkLen: 32 });
}

function blake2b512(buffer: Uint8Array): Uint8Array {
  return blake2b(buffer, { dkLen: 64 });
}

function hash160(buffer: Uint8Array): Uint8Array {
  return ripemd160(blake2b256(buffer));
}

function dblake2b256(buffer: Uint8Array): Uint8Array {
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
