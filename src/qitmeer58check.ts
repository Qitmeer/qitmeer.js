// Copyright 2017-2018 The Qirmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

"use strict";

import bs58 from "bs58";
import * as HashFunctions from "./hash";
import * as uint8arraytools from "uint8array-tools";

type ChecksumFn = (payload: Uint8Array) => Uint8Array;

interface Qitmeer58Check {
  encode: (payload: Uint8Array) => string;
  decode: (string: string) => Uint8Array;
  decodeUnsafe: (string: string) => Uint8Array | undefined;
}

function Qitmeer58checkBase(checksumFn: ChecksumFn): Qitmeer58Check {
  // Encode a buffer as a base58-check encoded string
  function encode(payload: Uint8Array): string {
    const checksum = checksumFn(payload);
    let res = uint8arraytools.concat([payload, checksum]);

    return bs58.encode(
      // uint8arraytools.concat([payload, checksum], payload.length + 4)
      res.slice(0, payload.length + 4)
    );
  }

  function decodeRaw(buffer: Uint8Array): Uint8Array | undefined {
    const payload = buffer.slice(0, -4);
    const checksum = buffer.slice(-4);
    const newChecksum = checksumFn(payload as Uint8Array);
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
  function decodeUnsafe(string: string): Uint8Array | undefined {
    const buffer = bs58.decodeUnsafe(string);
    if (!buffer) return undefined;

    return decodeRaw(Uint8Array.from(buffer));
  }

  function decode(string: string): Uint8Array {
    const buffer = Uint8Array.from(bs58.decode(string));
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
