const bip66 = require("bip66");
import typecheck from "./typecheck";
import types from "./types";
import * as uint8arraytools from "uint8array-tools";

const ZERO = new Uint8Array(1);

function toDER(x: Uint8Array): Uint8Array {
  let i = 0;
  while (x[i] === 0) ++i;
  if (i === x.length) return ZERO;
  x = x.slice(i);
  const res = uint8arraytools.concat([ZERO, x]);
  if ((x[0] as number) & 0x80) return res.slice(0, 1 + x.length);
  return x;
}

function fromDER(x: Uint8Array): Uint8Array {
  if (x[0] === 0x00) x = x.slice(1);
  const buffer = new Uint8Array(32);
  const bstart = Math.max(0, 32 - x.length);
  buffer.set(x, bstart);
  return buffer;
}

// BIP62: 1 byte hashType flag (only 0x01, 0x02, 0x03, 0x81, 0x82 and 0x83 are allowed)
function decode(buffer: Uint8Array): {
  signature: Uint8Array;
  hashType: number;
} {
  const hashType = uint8arraytools.readUInt8(buffer, buffer.length - 1);
  const hashTypeMod = hashType & ~0x80;
  if (hashTypeMod <= 0 || hashTypeMod >= 4)
    throw new Error("Invalid hashType " + hashType);

  const decode = bip66.decode(buffer.slice(0, -1));
  const r = fromDER(decode.r);
  const s = fromDER(decode.s);
  const res = uint8arraytools.concat([r, s]);
  return {
    signature: res.slice(0, 64),
    hashType: hashType,
  };
}

function encode(signature: Uint8Array, hashType: number): Uint8Array {
  typecheck(types.BufferN(64), signature);
  typecheck(types.UInt8, hashType);

  const hashTypeMod = hashType & ~0x80;
  if (hashTypeMod <= 0 || hashTypeMod >= 4)
    throw new Error("Invalid hashType " + hashType);

  const hashTypeBuffer = new Uint8Array(1);
  uint8arraytools.writeUInt8(hashTypeBuffer, 0, hashType);

  const r = toDER(signature.slice(0, 32));
  const s = toDER(signature.slice(32, 64));

  return uint8arraytools.concat([bip66.encode(r, s), hashTypeBuffer]);
}

export { decode, encode };
