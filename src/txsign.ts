// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

import Transaction from "./transaction";
import types from "./types";
import typecheck from "./typecheck";
import Script from "./script";
import * as addr from "./address";
import * as crypto from "./hash";
import * as Signature from "./signature";
import { NetworkConfig } from "./networks";

interface InputOptions {
  prevOutType?: string;
  prevOutScript?: Script;
  lockTime?: number;
  sequence?: number;
}

interface Input {
  input: Script;
  signatures: any;
  _prevOutId: string;
  prevOutTx: string;
  prevOutIndex: number;
  prevOutType: string;
  prevOutScript?: Script;
  lockTime: number;
  signature?: Buffer;
  pubkey?: Buffer;
}

export default class TxSigner {
  private __inputs: Input[];
  private __network: NetworkConfig;
  private __tx: Transaction;

  constructor(network: NetworkConfig) {
    this.__inputs = [];
    this.__network = network;
    this.__tx = new Transaction();
  }

  static newSigner(network: NetworkConfig): TxSigner {
    return new TxSigner(network);
  }

  setLockTime(locktime: number): void {
    typecheck(types.UInt32, locktime);

    if (this.__inputs.some((input) => input.signatures?.some((s: any) => s))) {
      throw new Error("No, this would invalidate signatures");
    }

    this.__tx.locktime = locktime;
  }

  setVersion(version: number): void {
    typecheck(types.UInt32, version);
    this.__tx.version = version;
  }

  setTimestamp(timestamp: number): void {
    typecheck(types.UInt32, timestamp);
    this.__tx.timestamp = timestamp;
  }

  addInput(txHash: string, vout: number, options: InputOptions = {}): void {
    typecheck(types.Hex32, txHash);
    typecheck(types.UInt32, vout);

    const hash = Buffer.from(txHash, "hex").reverse();
    const prevOutId = `${txHash}:${vout}`;

    if (this.__inputs.some((input) => input._prevOutId === prevOutId)) {
      throw new Error("Duplicate TxOut: " + prevOutId);
    }

    this.__inputs.push({
      _prevOutId: prevOutId,
      prevOutTx: txHash,
      prevOutIndex: vout,
      prevOutType: options.prevOutType || Script.types.P2PKH,
      prevOutScript: options.prevOutScript,
      lockTime: options.lockTime || 0,
      signatures: undefined,
      input: new Script(),
    });

    this.__tx.addInput(
      hash,
      vout,
      options.sequence as number,
      Buffer.from("0x", "hex")
    );
  }

  addOutput(address: string, amount: number, coinId?: number): void {
    typecheck(types.Base58, address);
    typecheck(types.Amount, amount);
    const scriptPubKey = addr
      .toOutputScript(address, this.__network)
      .toBuffer();
    this.__tx.addOutput(scriptPubKey, BigInt(amount), coinId as number);
  }

  sign(vin: number, keyPair: any, hashType?: number): void {
    const input = this.__inputs[vin];
    if (!input) {
      throw new Error("No input at index: " + vin);
    }

    hashType = hashType || Transaction.SIGHASH_ALL;
    const ourPubKey = keyPair.publicKey || keyPair.getPublicKey();

    if (!input.prevOutScript) {
      const hash = crypto.hash160(ourPubKey);
      input.prevOutScript =
        input.lockTime > 0
          ? Script.Output.CLTV(hash, input.lockTime)
          : Script.Output.P2PKH(hash);
    }

    const signHash = this.__tx.hashForSignature(
      vin,
      input.prevOutScript,
      hashType
    );
    const signature = keyPair.sign(signHash);
    input.signature = Signature.encode(signature, hashType);
    input.pubkey = ourPubKey;
  }

  build(): Transaction {
    const tx = this.__tx.clone();
    this.__inputs.forEach((input, i) => {
      tx.setInputScript(
        i,
        Script.Input.P2PKH(
          input.signature as Buffer,
          input.pubkey as Buffer
        ).toBuffer()
      );
    });
    return tx;
  }

  getTxId(): string {
    return this.__tx.getTxId();
  }
}
