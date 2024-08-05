// Copyright 2017-2018 The qitmeer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.
import { describe, it } from "mocha";
import assert from "assert";
import bs58 from "bs58";
import * as qitmeer from "../src";
import * as uint8arraytools from "uint8array-tools";
const data = require("./data/qitmeer.core/core.json");
describe("qitmeer-core", () => {
  // type check
  describe("type check", function () {
    it("hash256", function () {
      const hexStr =
        "5c0dff371fe9c762139570bdfef7d34aca5e84325871e67fd0203f0da8c5e50c";
      assert.strictEqual(qitmeer.typecheck(qitmeer.types.Hex, hexStr), true);
      assert.strictEqual(qitmeer.typecheck(qitmeer.types.Hex32, hexStr), true);
      assert.strictEqual(
        qitmeer.typecheck(
          qitmeer.types.Hash256,
          uint8arraytools.fromHex(hexStr)
        ),
        true
      );
    });
  });

  // base58
  describe("base58 test", () => {
    console.log(data);
    data.base58.forEach(function (f: [string, string]) {
      const hexStr = f[0];
      const b58Str = f[1];
      it("encode " + hexStr + " -> " + b58Str, function () {
        const encoded = bs58.encode(uint8arraytools.fromHex(hexStr));
        assert.strictEqual(encoded, b58Str);
      });
      it("decode " + b58Str + " -> " + hexStr, function () {
        const decoded = uint8arraytools.toHex(bs58.decode(b58Str));
        assert.strictEqual(decoded, hexStr);
      });
    });
  });

  // hash
  describe("qitmeer.hash", function () {
    data.hash.sha256.forEach(function (d: [string, string]) {
      const inputStr = d[0];
      const hashStr = d[1];
      it("sha256 " + inputStr + " -> " + hashStr, function () {
        const hash = uint8arraytools.toHex(
          qitmeer.hash.sha256(uint8arraytools.fromHex(inputStr))
        );
        assert.strictEqual(hash, hashStr);
      });
    });

    data.hash.blake2b256.forEach(function (d: [string, string]) {
      const inputStr = d[0];
      const hashStr = d[1];
      it("blake2b256 " + inputStr + " -> " + hashStr, function () {
        const hash = uint8arraytools.toHex(
          qitmeer.hash.blake2b256(uint8arraytools.fromHex(inputStr))
        );
        assert.strictEqual(hash, hashStr);
      });
    });

    data.hash.hash160.forEach(function (d: [string, string]) {
      const inputStr = d[0];
      const hashStr = d[1];
      it("hash160 " + inputStr + " -> " + hashStr, function () {
        const hash = uint8arraytools.toHex(
          qitmeer.hash.hash160(uint8arraytools.fromHex(inputStr))
        );
        assert.strictEqual(hash, hashStr);
      });
    });
  });

  // base58check
  describe("qitmeer.address", function () {
    data.base58check.forEach(function (
      f: [string, string, { coin: string; network: string }]
    ) {
      const hexStr = f[0];
      const qitmeer58checkStr = f[1];
      const { coin, network } = f[2];

      if (coin === "qitmeer") {
        it("fromBase58Check " + qitmeer58checkStr, function () {
          const decoded = qitmeer.address.fromBase58Check(qitmeer58checkStr);
          assert.strictEqual(uint8arraytools.toHex(decoded.hash), hexStr);
          switch (network) {
            case "privnet":
              assert.strictEqual(
                decoded.version,
                qitmeer.networks.privnet.pubKeyHashAddrId
              );
              break;
            case "mainnet":
              assert.strictEqual(
                decoded.version,
                qitmeer.networks.mainnet.pubKeyHashAddrId
              );
              break;
            case "testnet":
              assert.strictEqual(
                decoded.version,
                qitmeer.networks.testnet.pubKeyHashAddrId
              );
              break;
            default:
              assert.fail("unknown network " + network);
          }
        });

        it("toBase58Check " + hexStr, function () {
          let encoded: string;
          switch (network) {
            case "privnet":
              encoded = qitmeer.address.toBase58Check(
                uint8arraytools.fromHex(hexStr),
                qitmeer.networks.privnet.pubKeyHashAddrId
              );
              assert.strictEqual(encoded, qitmeer58checkStr);
              break;
            case "mainnet":
              encoded = qitmeer.address.toBase58Check(
                uint8arraytools.fromHex(hexStr),
                qitmeer.networks.mainnet.pubKeyHashAddrId
              );
              assert.strictEqual(encoded, qitmeer58checkStr);
              break;
            case "testnet":
              encoded = qitmeer.address.toBase58Check(
                uint8arraytools.fromHex(hexStr),
                qitmeer.networks.testnet.pubKeyHashAddrId
              );
              assert.strictEqual(encoded, qitmeer58checkStr);
              break;
            default:
              assert.fail("unknown network " + network);
          }
        });
      }
    });
  });

  describe("qitmeer.EC", function () {
    describe("wif compressed", function () {
      data.EC.wif.compressed.forEach(function (f: [string, string]) {
        const ecPrivStr = f[0];
        const wifStr = f[1];
        const ecPair = qitmeer.ec.fromWIF(wifStr);
        it("fromWIF " + wifStr, function () {
          assert.strictEqual(
            ecPrivStr,
            uint8arraytools.toHex(ecPair.privateKey as Uint8Array)
          );
          assert.strictEqual(true, ecPair.compressed);
        });
        it("toWIF " + ecPrivStr, function () {
          const wif = ecPair.toWIF();
          console.log(wifStr, wif);
          assert.strictEqual(wifStr, wif);
        });
      });
    });

    describe("wif uncompressed", function () {
      data.EC.wif.uncompressed.forEach(function (f: [string, string]) {
        const ecPrivStr = f[0];
        const wifStr = f[1];
        const ecPair = qitmeer.ec.fromWIF(wifStr);
        it("fromWIF " + wifStr, function () {
          assert.strictEqual(
            ecPrivStr,
            uint8arraytools.toHex(ecPair.privateKey as Uint8Array)
          );
          assert.strictEqual(false, ecPair.compressed);
        });
        it("toWIF " + ecPrivStr, function () {
          const wif = ecPair.toWIF();
          assert.strictEqual(wifStr, wif);
        });
      });
    });

    describe("keypair compressed", function () {
      data.EC.keypair.compressed.forEach(function (f: [string, string]) {
        const privHex = f[0];
        const pubHex = f[1];
        it("fromPrivateKey " + privHex, function () {
          const keyPair = qitmeer.ec.fromPrivateKey(
            uint8arraytools.fromHex(privHex)
          );
          assert.strictEqual(keyPair.compressed, true);
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.privateKey as Uint8Array),
            privHex
          );
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.__priv as Uint8Array),
            privHex
          );
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.publicKey as Uint8Array),
            pubHex
          );
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.__pub as Uint8Array),
            pubHex
          );
        });
        it("fromPubKey " + pubHex, function () {
          const keyPair = qitmeer.ec.fromPublicKey(
            uint8arraytools.fromHex(pubHex)
          );
          assert.strictEqual(keyPair.compressed, true);
          assert.strictEqual(keyPair.privateKey, null);
          assert.strictEqual(keyPair.__priv, null);
          assert.strictEqual(uint8arraytools.toHex(keyPair.publicKey), pubHex);
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.__pub as Uint8Array),
            pubHex
          );
        });
      });
    });

    describe("keypair uncompressed", function () {
      data.EC.keypair.uncompressed.forEach(function (f: [string, string]) {
        const privHex = f[0];
        const pubHex = f[1];
        it("fromPrivateKey " + privHex, function () {
          const keyPair = qitmeer.ec.fromPrivateKey(
            uint8arraytools.fromHex(privHex),
            {
              compressed: false,
            }
          );
          assert.strictEqual(keyPair.compressed, false);
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.privateKey as Uint8Array),
            privHex
          );
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.__priv as Uint8Array),
            privHex
          );
          assert.strictEqual(uint8arraytools.toHex(keyPair.publicKey), pubHex);
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.__pub as Uint8Array),
            pubHex
          );
        });
        it("fromPubKey " + pubHex, function () {
          const keyPair = qitmeer.ec.fromPublicKey(
            uint8arraytools.fromHex(pubHex),
            {
              compressed: false,
            }
          );
          assert.strictEqual(keyPair.compressed, false);
          assert.strictEqual(keyPair.privateKey, null);
          assert.strictEqual(keyPair.__priv, null);
          assert.strictEqual(uint8arraytools.toHex(keyPair.publicKey), pubHex);
          assert.strictEqual(
            uint8arraytools.toHex(keyPair.__pub as Uint8Array),
            pubHex
          );
        });
      });
    });
  });
});
