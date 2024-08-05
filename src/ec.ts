// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

const secp256k1 = require("tiny-secp256k1");
const randomBytes = require("randombytes");
import * as wif from "./wif";
import { NetworkConfig, networks } from "./networks";

interface ECOptions {
  compressed?: boolean;
  network?: NetworkConfig;
  rng?: any;
}

interface WIFDecoded {
  privateKey: Uint8Array;
  compressed: boolean;
}

class EC {
  public __priv: Uint8Array | null;
  public __pub: Uint8Array | null;
  public compressed: boolean;
  public network: NetworkConfig;

  constructor(
    priv: Uint8Array | null,
    pub: Uint8Array | null,
    options: ECOptions = {}
  ) {
    this.compressed =
      options.compressed === undefined ? true : options.compressed;
    this.network = options.network || networks.privnet;
    this.__priv = priv || null;
    this.__pub = null;
    if (pub)
      this.__pub = Uint8Array.from(
        secp256k1.pointCompress(pub, this.compressed)
      );
  }

  get privateKey(): Uint8Array | null {
    return this.__priv;
  }

  get publicKey(): Uint8Array {
    if (!this.__pub)
      this.__pub = Uint8Array.from(
        secp256k1.pointFromScalar(this.__priv!, this.compressed) as Uint8Array
      );
    return this.__pub as Uint8Array;
  }

  toWIF(): string {
    if (!this.__priv) throw new Error("Missing private key");
    return wif.encode(this.__priv, this.compressed);
  }

  sign(hash: Uint8Array): Uint8Array {
    if (!this.__priv) throw new Error("Missing private key");
    return Uint8Array.from(secp256k1.sign(hash, this.__priv));
  }

  verify(hash: Uint8Array, signature: Uint8Array): boolean {
    return secp256k1.verify(hash, this.publicKey, signature);
  }
}

function fromEntropy(options: ECOptions = {}): EC {
  const rng = options.rng || randomBytes;
  let x: Uint8Array;
  do {
    x = rng(32);
  } while (!secp256k1.isPrivate(x));

  return fromPrivateKey(x, options);
}

function fromPrivateKey(buffer: Uint8Array, options: ECOptions = {}): EC {
  if (!secp256k1.isPrivate(buffer))
    throw new TypeError("Private key not in range [1, n)");
  return new EC(buffer, null, options);
}

function fromPublicKey(buffer: Uint8Array, options: ECOptions = {}): EC {
  return new EC(null, buffer, options);
}

function fromWIF(string: string): EC {
  const decoded: WIFDecoded = wif.decode(string);
  return fromPrivateKey(decoded.privateKey, {
    compressed: decoded.compressed,
  });
}

export { fromEntropy, fromPrivateKey, fromPublicKey, fromWIF };
