// https://github.com/feross/buffer/blob/master/index.js#L1127

import * as uint8arraytools from "uint8array-tools";

function verifyUInt(value: number, max: number): void {
  if (typeof value !== "number")
    throw new Error("cannot write a non-number as a number");
  if (value < 0)
    throw new Error("specified a negative value for writing an unsigned value");
  if (value > max) throw new Error("RangeError: value out of range");
  if (Math.floor(value) !== value)
    throw new Error("value has a fractional component");
}

function readUInt64LE(buffer: Uint8Array, offset: number): number {
  const a = uint8arraytools.readUInt32(buffer, offset, "LE");
  let b = uint8arraytools.readUInt32(buffer, offset + 4, "LE");
  b *= 0x100000000;

  verifyUInt(b + a, 0x001fffffffffffff);
  return b + a;
}

function writeUInt64LE(
  buffer: Uint8Array,
  value: number,
  offset: number
): number {
  verifyUInt(value, 0x001fffffffffffff);

  uint8arraytools.writeUInt32(buffer, offset, value & -1, "LE");
  uint8arraytools.writeUInt32(
    buffer,
    offset + 4,
    Math.floor(value / 0x100000000),
    "LE"
  );
  return offset + 8;
}

export { readUInt64LE, writeUInt64LE };
