// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const varuint = require("varuint-bitcoin");
import Transaction from "./transaction";
import * as hash from "./hash";
const fastMerkleRoot = require("merkle-lib/fastRoot");

const BlockHeaderSize = 4 + 32 + 32 + 32 + 4 + 4 + (4 + 1 + 1 + 168);

interface PowData {
  edge_bits: number;
  circle_nonces: Buffer;
}

interface BlockPow {
  nonce: number;
  pow_type: number;
  proof_data: PowData;
}

export default class Block {
  version: number;
  parentRoot: Buffer | null;
  txRoot: Buffer | null;
  stateRoot: Buffer | null;
  difficulty: number;
  timestamp: Date;
  nonce: number;
  transactions: Transaction[];
  parents: Buffer[];
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
        circle_nonces: Buffer.alloc(168),
      },
    };
  }

  static fromBuffer(buffer: Buffer): Block {
    if (buffer.length < 80) throw new Error("Buffer too small (< 80 bytes)");

    let offset = 0;

    function readSlice(n: number): Buffer {
      offset += n;
      return buffer.slice(offset - n, offset);
    }

    function readUInt32(): number {
      const i = buffer.readUInt32LE(offset);
      offset += 4;
      return i;
    }

    function readInt32(): number {
      const i = buffer.readInt32LE(offset);
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

  toBuffer(headersOnly?: boolean): Buffer {
    const buffer = Buffer.allocUnsafe(this.byteLength(headersOnly));
    let offset = 0;

    function writeSlice(slice: Buffer): number {
      slice.copy(buffer, offset);
      offset += slice.length;
      return offset;
    }

    function writeInt32(i: number): number {
      buffer.writeInt32LE(i, offset);
      offset += 4;
      return offset;
    }

    function writeUInt32(i: number): number {
      buffer.writeUInt32LE(i, offset);
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

  getHashBuffer(): Buffer {
    return hash.dblake2b256(
      this.toBuffer(true).slice(0, BlockHeaderSize - 169)
    );
  }

  getHash(): string {
    return this.getHashBuffer().reverse().toString("hex");
  }

  static calculateTxRoot(transactions: Transaction[]): Buffer {
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
    return this.txRoot!.compare(actualTxRoot) === 0;
  }
}
