// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const OPS = require("./ops/ops.json");
const OPS_MAP = require("./ops/map");
import * as utils from "./ops/utils";

export interface SCRIPT_TYPE {
  NONSTANDARD: string;
  NULLDATA: string;
  P2PK: string;
  P2PKH: string;
  P2SH: string;
}

class Script {
  version: number;
  stack: Array<number | Buffer | string>;

  constructor() {
    this.version = 1; // not used, reversed
    this.stack = [];
  }

  static types: SCRIPT_TYPE = {
    NONSTANDARD: "nonstandard",
    NULLDATA: "nulldata",
    P2PK: "pubkey",
    P2PKH: "pubkeyhash",
    P2SH: "scripthash",
  };

  static Output = {
    P2PKH: __publicKeyScript,
    CLTV: __cltvScript,
    P2SH: __scriptHash,
  };

  static Input = {
    P2PKH: __signatureScript,
    P2PK: __signatureScript,
  };

  static fromBuffer(buffer: Buffer): Script | null {
    const script = new Script();
    if (Buffer.isBuffer(buffer)) {
      let i = 0;
      while (i < buffer.length) {
        const opcode = buffer[i] as number;
        // data chunk
        if (opcode > OPS.OP_0 && opcode <= OPS.OP_PUSHDATA4) {
          const d = utils.decode(buffer, i);

          // did reading a pushDataInt fail?
          if (d === null) return null;
          i += d.size;

          // attempt to read too much data?
          if (i + d.number > buffer.length) return null;

          const data = buffer.slice(i, i + d.number);
          i += d.number;

          // decompile minimally
          const op = utils.asMinimalOP(data);
          if (op !== undefined) {
            script.stack.push(op);
          } else {
            script.stack.push(data);
          }

          // opcode
        } else {
          script.stack.push(opcode);
          i += 1;
        }
      }
    }
    return script;
  }

  static fromAsm(asm: string): Script {
    const script = new Script();
    script.stack = asm.split(" ").map((chunkStr) => {
      // opcode?
      if (OPS[chunkStr] !== undefined) return OPS[chunkStr];
      // data!
      return Buffer.from(chunkStr, "hex");
    });
    return script;
  }

  toAsm(): string {
    return this.stack
      .map((chunk) => {
        // data?
        if (Buffer.isBuffer(chunk)) {
          const newchunk = chunk as Buffer;
          const op = utils.asMinimalOP(newchunk);
          if (op === undefined) return newchunk.toString("hex");
          chunk = op;
        }
        // opcode!
        return OPS_MAP[chunk as string];
      })
      .join(" ");
  }

  toBuffer(): Buffer {
    let lockIndex: number | undefined;
    const bufferSize = this.stack.reduce((accum, chunk, i) => {
      if (typeof chunk === "string" && chunk === "cltv") {
        lockIndex = 1;
        return accum;
      }
      if (typeof lockIndex === "number" && lockIndex === i) {
        if (chunk === 0) {
          return (accum as number) + 1;
        } else if ((chunk as number) >= 1 && (chunk as number) <= 16) {
          return (accum as number) + 1;
        } else {
          const result = Buffer.alloc(9);
          let dataLen = 0;
          let n = chunk as number;
          while (n > 0) {
            result.writeUInt8(n & 0xff, dataLen);
            n >>= 8;
            dataLen++;
          }
          if (((result[dataLen - 1] as number) & 0x80) !== 0) {
            dataLen++;
          }
          return (accum as number) + dataLen + 1;
        }
      }
      // data chunk
      if (Buffer.isBuffer(chunk)) {
        const newBuffer = chunk as Buffer;
        // adhere to BIP62.3, minimal push policy
        if (
          newBuffer.length === 1 &&
          utils.asMinimalOP(newBuffer) !== undefined
        ) {
          return (accum as number) + 1;
        }
        return (
          (accum as number) +
          utils.encodingLength(newBuffer.length) +
          newBuffer.length
        );
      }
      // opcode
      return (accum as number) + 1;
    }, 0.0);
    const buffer = Buffer.allocUnsafe(bufferSize as number);
    let offset = 0;

    this.stack.forEach((chunk, index) => {
      // Judge whether it is locked or not
      if (typeof chunk === "string" && chunk === "cltv") return;
      // Lock execution
      if (typeof lockIndex === "number" && lockIndex === index) {
        if (chunk === 0) {
          buffer.writeUInt8(OPS.OP_0, offset);
          offset += 1;
        } else if ((chunk as number) >= 1 && (chunk as number) <= 16) {
          buffer.writeUInt8(OPS.OP_1 - 1 + (chunk as number), offset);
          offset += 1;
        } else {
          let dataLen = 0;
          const data = Buffer.alloc(12);
          let n = chunk as number;
          while (n > 0) {
            data.writeUInt8(n & 0xff, dataLen);
            n >>= 8;
            dataLen++;
          }
          if (((data[dataLen - 1] as number) & 0x80) !== 0) {
            dataLen++;
          }

          buffer.writeUInt8(dataLen, offset);
          offset++;
          while ((chunk as number) > 0) {
            buffer.writeUInt8((chunk as number) & 0xff, offset);
            (chunk as number) >>= 8;
            offset += 1;
          }
          if (((buffer[offset - 1] as number) & 0x80) !== 0) {
            buffer.writeUInt8(0x00, offset);
            offset += 1;
          }
        }
      } else if (Buffer.isBuffer(chunk)) {
        // adhere to BIP62.3, minimal push policy
        const opcode = utils.asMinimalOP(chunk as Buffer);
        if (opcode !== undefined) {
          buffer.writeUInt8(opcode, offset);
          offset += 1;
          return;
        }

        offset += utils.encode(buffer, (chunk as Buffer).length, offset);
        (chunk as Buffer).copy(buffer, offset);
        offset += (chunk as Buffer).length;
      } else {
        buffer.writeUInt8(chunk as number, offset);
        offset += 1;
      }
    });

    if (offset !== buffer.length) throw new Error("Could not decode chunks");
    return buffer;
  }

  removeOP(op: number): Script {
    this.stack = this.stack.filter((x) => x !== op);
    return this;
  }

  removeCodeSeparator(): Script {
    this.removeOP(OPS.OP_CODESEPARATOR);
    return this;
  }
}

// Helper functions

function __publicKeyScript(hash: Buffer): Script {
  const script = new Script();
  script.stack = [
    OPS.OP_DUP,
    OPS.OP_HASH160,
    hash,
    OPS.OP_EQUALVERIFY,
    OPS.OP_CHECKSIG,
  ];
  return script;
}

function __cltvScript(hash: Buffer, lockTime: number): Script {
  const script = new Script();
  script.stack = [
    "cltv",
    lockTime,
    OPS.OP_CHECKLOCKTIMEVERIFY,
    OPS.OP_DROP,
    OPS.OP_DUP,
    OPS.OP_HASH160,
    hash,
    OPS.OP_EQUALVERIFY,
    OPS.OP_CHECKSIG,
  ];
  return script;
}

function __scriptHash(hash: Buffer): Script {
  const script = new Script();
  script.stack = [OPS.OP_HASH160, hash, OPS.OP_EQUAL];
  return script;
}

function __signatureScript(signature: Buffer, pubkey: Buffer): Script {
  const script = new Script();
  script.stack = [signature, pubkey];
  return script;
}

export default Script;
