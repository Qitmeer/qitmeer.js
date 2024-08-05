// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const varuint = require("varuint-bitcoin");
import Transaction from "./transaction";
import * as hash from "./hash";
const fastMerkleRoot = require("merkle-lib/fastRoot");
import * as uint8arraytools from "uint8array-tools";

const BlockHeaderSize = 4 + 32 + 32 + 32 + 4 + 4 + (4 + 1 + 1 + 168);

interface PowData {
  edge_bits: number;
  circle_nonces: Uint8Array;
}

interface BlockPow {
  nonce: number;
  pow_type: number;
  proof_data: PowData;
}

export default class Block {
  version: number;
  parentRoot: Uint8Array | null;
  txRoot: Uint8Array | null;
  stateRoot: Uint8Array | null;
  difficulty: number;
  timestamp: Date;
  nonce: number;
  transactions: Transaction[];
  parents: Uint8Array[];
  pow: BlockPow;

  constructor() {
    this.version = 1;
    this.parentRoot = null;
    this.txRoot = null;
    this.stateRoot = null;
    this.difficulty = 0;
    this.timestamp = new Date(0);
    this.nonce = 0;
    this.transactions = [];
    this.parents = [];
    this.pow = {
      nonce: 0,
      pow_type: 0,
      proof_data: {
        edge_bits: 0,
        circle_nonces: new Uint8Array(168),
      },
    };
  }

  static fromBuffer(buffer: Uint8Array): Block {
    if (buffer.length < 80)
      throw new Error("Uint8Array too small (< 80 bytes)");

    let offset = 0;

    function readSlice(n: number): Uint8Array {
      offset += n;
      return buffer.slice(offset - n, offset);
    }

    function readUInt32(): number {
      const i = uint8arraytools.readUInt32(buffer, offset, "LE");
      offset += 4;
      return i;
    }

    function readInt32(): number {
      const i = uint8arraytools.readUInt32(buffer, offset, "LE");
      offset += 4;
      return i;
    }

    function readVarInt(): number {
      const vi = varuint.decode(buffer, offset);
      offset += varuint.decode.bytes;
      return vi;
    }

    const block = new Block();
    block.version = readInt32();
    block.parentRoot = readSlice(32);
    block.txRoot = readSlice(32);
    block.stateRoot = readSlice(32);
    block.difficulty = readUInt32();
    block.timestamp = new Date(readUInt32() * 1000);

    // pow
    block.pow = {
      nonce: readUInt32(),
      pow_type: readVarInt(),
      proof_data: {
        edge_bits: readVarInt(),
        circle_nonces: readSlice(168),
      },
    };

    if (buffer.length === BlockHeaderSize) return block;

    // parents
    const parentsLength = readVarInt();
    block.parents = [];
    for (let i = 0; i < parentsLength; ++i) {
      const parent = readSlice(32);
      block.parents.push(parent);
    }

    // transactions
    function readTransaction(): Transaction {
      const tx = Transaction.fromBuffer(buffer.slice(offset), true);
      offset += tx.byteLength();
      return tx;
    }

    const nTransactions = readVarInt();
    block.transactions = [];
    for (let i = 0; i < nTransactions; ++i) {
      const tx = readTransaction();
      block.transactions.push(tx);
    }

    return block;
  }

  byteLength(headersOnly?: boolean): number {
    if (headersOnly || !this.transactions) return BlockHeaderSize;

    const transactionsLength = varuint.encodingLength(this.transactions.length);
    const transactionsByteLength = this.transactions.reduce(
      (a, x) => a + x.byteLength(),
      0
    );
    const parentsLength =
      varuint.encodingLength(this.parents.length) + this.parents.length * 32;

    return (
      BlockHeaderSize +
      transactionsLength +
      transactionsByteLength +
      parentsLength
    );
  }

  toBuffer(headersOnly?: boolean): Uint8Array {
    const buffer = new Uint8Array(this.byteLength(headersOnly));
    let offset = 0;

    function writeSlice(slice: Uint8Array): number {
      // slice.copy(buffer, offset);
      buffer.set(slice, offset);
      // for (var i = offset; i < slice.length; i++) buffer[i] = slice[i];
      offset += slice.length;
      return offset;
    }

    function writeInt32(i: number): number {
      uint8arraytools.writeUInt32(buffer, offset, i, "LE");
      offset += 4;
      return offset;
    }

    function writeUInt32(i: number): number {
      uint8arraytools.writeUInt32(buffer, offset, i, "LE");
      offset += 4;
      return offset;
    }

    function writeVarInt(i: number): number {
      varuint.encode(i, buffer, offset);
      offset += varuint.encode.bytes;
      return offset;
    }

    writeInt32(this.version);
    writeSlice(this.parentRoot!);
    writeSlice(this.txRoot!);
    writeSlice(this.stateRoot!);
    writeUInt32(this.difficulty);

    const timestamp = Math.floor(this.timestamp.getTime() / 1000);
    writeUInt32(timestamp);

    // pow
    writeUInt32(this.pow.nonce);
    writeVarInt(this.pow.pow_type);
    writeVarInt(this.pow.proof_data.edge_bits);
    writeSlice(this.pow.proof_data.circle_nonces);

    if (headersOnly || !this.transactions) return buffer;

    // parents
    writeVarInt(this.parents.length);
    this.parents.forEach((parent) => writeSlice(parent));

    writeVarInt(this.transactions.length);
    this.transactions.forEach((tx) => {
      const txSize = tx.byteLength();
      tx.toBuffer(buffer, offset);
      offset += txSize;
    });

    return buffer;
  }

  getHashBuffer(): Uint8Array {
    return hash.dblake2b256(
      this.toBuffer(true).slice(0, BlockHeaderSize - 169)
    );
  }

  getHash(): string {
    return uint8arraytools.toHex(this.getHashBuffer().reverse());
  }

  static calculateTxRoot(transactions: Transaction[]): Uint8Array {
    if (transactions.length === 0)
      throw TypeError("Cannot compute merkle root for zero transactions");

    const hashes = transactions.map((transaction) =>
      transaction.getTxIdBuffer()
    );
    return fastMerkleRoot(hashes, hash.dblake2b256);
  }

  checkTxRoot(): boolean {
    if (!this.transactions) return false;

    const actualTxRoot = Block.calculateTxRoot(this.transactions);
    // uint8arraytools.compare(this.txRoot as Uint8Array, actualTxRoot);
    return (
      uint8arraytools.compare(this.txRoot as Uint8Array, actualTxRoot) === 0
    );
  }
}
