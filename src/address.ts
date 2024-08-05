// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

import qitmeer58check from "./qitmeer58check";
import { NetworkConfig } from "./networks";
import Script from "./script";
import types from "./types";
import typecheck from "./typecheck";
import * as uint8arraytools from "uint8array-tools";

interface DecodeResult {
  version: number;
  hash: Uint8Array;
}

export { fromBase58Check, toBase58Check, toOutputScript };

function fromBase58Check(address: string): DecodeResult {
  const payload = qitmeer58check.default.decode(address);
  if (!payload || payload.length < 22)
    throw new TypeError(`${address} is too short`);
  if (payload.length > 22) throw new TypeError(`${address} is too long`);

  const version = uint8arraytools.readUInt16(payload, 0, "BE");
  const hash = payload.slice(2);

  return { version, hash };
}

function toBase58Check(hash: Uint8Array, version: number): string {
  typecheck(types.Hash160, hash);
  const payload = new Uint8Array(22);
  uint8arraytools.writeUInt16(payload, 0, version, "BE");
  // hash.copy(payload, 2);
  payload.set(hash, 2);
  // for (var i = 2; i < payload.length; i++) hash[i] = payload[i];
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
