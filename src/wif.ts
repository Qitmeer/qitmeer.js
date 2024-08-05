// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

import qitmeer58check from "./qitmeer58check";
import types from "./types";
import * as uint8arraytools from "uint8array-tools";

interface DecodeResult {
  version: number;
  privateKey: Uint8Array;
  compressed: boolean;
}

function decodeRaw(buffer: Uint8Array, version?: number): DecodeResult {
  // check version only if defined
  if (version !== undefined && buffer[0] !== version)
    throw new Error("Invalid network version");

  // uncompressed
  if (buffer.length === 33) {
    return {
      version: buffer[0] as number,
      privateKey: buffer.slice(1, 33),
      compressed: false,
    };
  }

  // invalid length
  if (buffer.length !== 34) throw new Error("Invalid WIF length");

  // invalid compression flag
  if (buffer[33] !== 0x01) throw new Error("Invalid compression flag");

  return {
    version: buffer[0] as number,
    privateKey: buffer.slice(1, 33),
    compressed: true,
  };
}

function encodeRaw(
  privateKey: Uint8Array,
  compressed: boolean,
  version?: number
): Uint8Array {
  const result = new Uint8Array(compressed ? 34 : 33);
  if (types.Nil(version)) {
    version = 0x80;
  }
  uint8arraytools.writeUInt8(result, 0, version as number);
  result.set(privateKey, 1);
  // privateKey.copy(result, 1);
  if (compressed) {
    result[33] = 0x01;
  }

  return result;
}

function decode(string: string, version?: number): DecodeResult {
  if (types.Nil(version)) version = 0x80;
  return decodeRaw(
    qitmeer58check.Qitmeer58checkdsha256.decode(string),
    version
  );
}

function encode(
  privateKey: Uint8Array,
  compressed: boolean,
  version?: number
): string {
  return qitmeer58check.Qitmeer58checkdsha256.encode(
    encodeRaw(privateKey, compressed, version)
  );
}

export { decode, decodeRaw, encode, encodeRaw };
