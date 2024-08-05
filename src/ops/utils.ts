// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const OPS = require("./ops.json");

import * as uint8arraytools from "uint8array-tools";

function encodingLength(i: number): number {
  return i < OPS.OP_PUSHDATA1 ? 1 : i <= 0xff ? 2 : i <= 0xffff ? 3 : 5;
}

function encode(buffer: Uint8Array, number: number, offset: number): number {
  const size = encodingLength(number);

  // ~6 bit
  if (size === 1) {
    uint8arraytools.writeUInt8(buffer, offset, number);

    // 8 bit
  } else if (size === 2) {
    uint8arraytools.writeUInt8(buffer, offset, OPS.OP_PUSHDATA1);
    uint8arraytools.writeUInt8(buffer, offset + 1, number);

    // 16 bit
  } else if (size === 3) {
    uint8arraytools.writeUInt8(buffer, offset, OPS.OP_PUSHDATA2);
    uint8arraytools.writeUInt16(buffer, offset + 1, number, "LE");

    // 32 bit
  } else {
    uint8arraytools.writeUInt8(buffer, offset, OPS.OP_PUSHDATA4);
    uint8arraytools.writeUInt16(buffer, offset + 1, number, "LE");
  }

  return size;
}

interface DecodeResult {
  opcode: number;
  number: number;
  size: number;
}

function decode(buffer: Uint8Array, offset: number): DecodeResult | null {
  const opcode = uint8arraytools.readUInt8(buffer, offset);
  let number: number;
  let size: number;

  // ~6 bit
  if (opcode < OPS.OP_PUSHDATA1) {
    number = opcode;
    size = 1;

    // 8 bit
  } else if (opcode === OPS.OP_PUSHDATA1) {
    if (offset + 2 > buffer.length) return null;
    number = uint8arraytools.readUInt8(buffer, offset + 1);
    size = 2;

    // 16 bit
  } else if (opcode === OPS.OP_PUSHDATA2) {
    if (offset + 3 > buffer.length) return null;
    number = uint8arraytools.readUInt16(buffer, offset + 1, "LE");
    size = 3;

    // 32 bit
  } else {
    if (offset + 5 > buffer.length) return null;
    if (opcode !== OPS.OP_PUSHDATA4) throw new Error("Unexpected opcode");

    number = uint8arraytools.readUInt16(buffer, offset + 1, "LE");
    size = 5;
  }

  return {
    opcode: opcode,
    number: number,
    size: size,
  };
}

const OP_INT_BASE = OPS.OP_RESERVED; // OP_1 - 1

function asMinimalOP(buffer: Uint8Array): number | undefined {
  if (buffer.length === 0) return OPS.OP_0;
  if (buffer.length !== 1) return;
  if ((buffer[0] as number) >= 1 && (buffer[0] as number) <= 16)
    return OP_INT_BASE + (buffer[0] as number);
  if (buffer[0] === 0x81) return OPS.OP_1NEGATE;
  return;
}

export { encodingLength, encode, decode, asMinimalOP };
