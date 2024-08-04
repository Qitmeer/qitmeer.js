// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const Buffer = require("safe-buffer").Buffer;
import qitmeer58check from "./qitmeer58check";
import { NetworkConfig } from "./networks";
import Script from "./script";
import types from "./types";
import typecheck from "./typecheck";

interface DecodeResult {
  version: number;
  hash: Buffer;
}

export { fromBase58Check, toBase58Check, toOutputScript };

function fromBase58Check(address: string): DecodeResult {
  const payload = qitmeer58check.default.decode(address);
  if (!payload || payload.length < 22)
    throw new TypeError(`${address} is too short`);
  if (payload.length > 22) throw new TypeError(`${address} is too long`);

  const version = payload.readUInt16BE(0);
  const hash = payload.slice(2);

  return { version, hash };
}

function toBase58Check(hash: Buffer, version: number): string {
  typecheck(types.Hash160, hash);
  const payload = Buffer.allocUnsafe(22);
  payload.writeUInt16BE(version, 0);
  hash.copy(payload, 2);
  return qitmeer58check.default.encode(payload);
}

function toOutputScript(address: string, network: NetworkConfig): Script {
  const decode = fromBase58Check(address);
  if (decode) {
    if (decode.version === network.pubKeyHashAddrId)
      return Script.Output.P2PKH(decode.hash);
    if (decode.version === network.ScriptHashAddrID)
      return Script.Output.P2SH(decode.hash);
    throw new Error(`Unknown version ${decode.version}`);
  }
  throw new Error(`Failed to base58check decode ${address}`);
}
