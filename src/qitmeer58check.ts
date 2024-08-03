// Copyright 2017-2018 The Qirmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

"use strict";

import base58 from "bs58";
const Buffer = require("safe-buffer").Buffer;
import * as HashFunctions from "./hash";

type ChecksumFn = (payload: Buffer) => Buffer;

interface Qitmeer58Check {
  encode: (payload: Buffer) => string;
  decode: (string: string) => Buffer;
  decodeUnsafe: (string: string) => Buffer | undefined;
}

function Qitmeer58checkBase(checksumFn: ChecksumFn): Qitmeer58Check {
  // Encode a buffer as a base58-check encoded string
  function encode(payload: Buffer): string {
    const checksum = checksumFn(payload);

    return base58.encode(
      Buffer.concat([payload, checksum], payload.length + 4)
    );
  }

  function decodeRaw(buffer: Buffer): Buffer | undefined {
    const payload = buffer.slice(0, -4);
    const checksum = buffer.slice(-4);
    const newChecksum = checksumFn(payload);
    if (
      ((checksum[0] as number) ^ (newChecksum[0] as number)) |
      ((checksum[1] as number) ^ (newChecksum[1] as number)) |
      ((checksum[2] as number) ^ (newChecksum[2] as number)) |
      ((checksum[3] as number) ^ (newChecksum[3] as number))
    )
      return;

    return payload;
  }

  // Decode a base58-check encoded string to a buffer, no result if checksum is wrong
  function decodeUnsafe(string: string): Buffer | undefined {
    const buffer = base58.decodeUnsafe(string);
    if (!buffer) return undefined;

    return decodeRaw(buffer);
  }

  function decode(string: string): Buffer {
    const buffer = base58.decode(string);
    const payload = decodeRaw(buffer);
    if (!payload) throw new Error("Invalid checksum");
    return payload;
  }

  return {
    encode,
    decode,
    decodeUnsafe,
  };
}

const qitmeer58check = {
  default: Qitmeer58checkBase(HashFunctions.dblake2b256),
  Qitmeer58checkdsha256: Qitmeer58checkBase(HashFunctions.dsha256),
  Qitmeer58checkBase,
};

export default qitmeer58check;
