// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

export interface NetworkConfig {
  pubKeyHashAddrId: number;
  ScriptHashAddrID: number;
  PrivateKeyID: number;
}

export interface Networks {
  mainnet: NetworkConfig;
  testnet: NetworkConfig;
  privnet: NetworkConfig;
  mixnet: NetworkConfig;
}

const networks: Networks = {
  mainnet: {
    pubKeyHashAddrId: 0x0bb1,
    ScriptHashAddrID: 0x0b81,
    PrivateKeyID: 0x22dc,
  },
  testnet: {
    pubKeyHashAddrId: 0x0f14,
    ScriptHashAddrID: 0x0ee2,
    PrivateKeyID: 0x0ce2,
  },
  privnet: {
    pubKeyHashAddrId: 0x0df1,
    ScriptHashAddrID: 0x0dc2,
    PrivateKeyID: 0x0cdd,
  },
  mixnet: {
    pubKeyHashAddrId: 0x1152,
    ScriptHashAddrID: 0x1123,
    PrivateKeyID: 0x2326,
  },
};

export { networks };
