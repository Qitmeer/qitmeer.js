const wallet = require('./../wallet/index');

//生成随机钱包
const w = new wallet('1', '1');
console.log(w);
//生成随机加密钱包
const ce = wallet.createEncrypt(w.words, w.password, w.tips);
console.log(ce);

const dk = wallet.decryptKey(ce.words, '1');
console.log(dk);

const wArr = wallet.walletArray();
console.log(wArr);

const wt = wallet.walletTree();
console.log(wt);

const cs = wallet.createSingle('hlc-privnet', w.words, '1');
console.log(cs);

// wallet.getETHTotal('gzh-token-ropsten', '0xd6f6c99d72ff38b0fb0d84a1e020bc598342bf635126f81178ee39f84792e355', function (amount) {
//     console.log(amount);
// });
//
// wallet.getETHTotal('eth-ropsten', '0xd6f6c99d72ff38b0fb0d84a1e020bc598342bf635126f81178ee39f84792e355', function (amount) {
//     console.log(amount);
// });

// wallet.txSign('gzh-token-ropsten', {
//     privateKey: '0xd6f6c99d72ff38b0fb0d84a1e020bc598342bf635126f81178ee39f84792e355',
//     to: '0x5d2e279654C34536c33AcB36B74e3C20b8DeD08D',
//     value: 123,
//     fees: 1.4,
//     success: function (tx) {
//         console.log(tx);
//     }
// });

// wallet.txSign('eth-ropsten', {
//     privateKey: '0xd6f6c99d72ff38b0fb0d84a1e020bc598342bf635126f81178ee39f84792e355',
//     to: '0x5d2e279654C34536c33AcB36B74e3C20b8DeD08D',
//     value: 0.1,
//     fees: 1.4,
//     success: function (tx) {
//         console.log(tx);
//     }
// });

const data = {
    "pagesTotal": 1,
    "txs": [
        {
            "txid": "661e400406629dae8b5da88e66dc7928b617db0b16d1c7175c4d77cc2d997080",
            "version": 2,
            "locktime": 0,
            "vin": [
                {
                    "txid": "356d643e7ecdafefdd3db5c3a341ef5e1355901a78d43cb469eb1bce89bd5c9a",
                    "vout": 1,
                    "sequence": 4294967295,
                    "n": 0,
                    "scriptSig": {
                        "hex": "47304402202e536696db35ffe1fea7a20cb263d54e0506050ce529c8d3bfb245cdaaa652f5022064e2c1f66056716f8cc81fdd8ba7e1ec149bd9979d38edb79bdfabd63b20d103012102b3e7c21a906433171cad38589335002c34a6928e19b7798224077c30f03e835e",
                        "asm": "304402202e536696db35ffe1fea7a20cb263d54e0506050ce529c8d3bfb245cdaaa652f5022064e2c1f66056716f8cc81fdd8ba7e1ec149bd9979d38edb79bdfabd63b20d103[ALL] 02b3e7c21a906433171cad38589335002c34a6928e19b7798224077c30f03e835e"
                    },
                    "addr": "miqqJGBoxoPxjY9Kpe4dCKqmNfeuYD55gE",
                    "valueSat": 74219080,
                    "value": 0.7421908,
                    "doubleSpentTxID": null
                }
            ],
            "vout": [
                {
                    "value": "0.01000000",
                    "n": 0,
                    "scriptPubKey": {
                        "hex": "76a91467ef4fc887be76a8c1d1f29e0c555ab05d44a00a88ac",
                        "asm": "OP_DUP OP_HASH160 67ef4fc887be76a8c1d1f29e0c555ab05d44a00a OP_EQUALVERIFY OP_CHECKSIG",
                        "addresses": [
                            "mpzWaUfQCBm4cRazYQ13WVSg8yMHAwBj8z"
                        ],
                        "type": "pubkeyhash"
                    },
                    "spentTxId": null,
                    "spentIndex": null,
                    "spentHeight": null
                },
                {
                    "value": "0.73209080",
                    "n": 1,
                    "scriptPubKey": {
                        "hex": "76a914247a70b8f5e1ef39326273710a26b8da4750749988ac",
                        "asm": "OP_DUP OP_HASH160 247a70b8f5e1ef39326273710a26b8da47507499 OP_EQUALVERIFY OP_CHECKSIG",
                        "addresses": [
                            "miqqJGBoxoPxjY9Kpe4dCKqmNfeuYD55gE"
                        ],
                        "type": "pubkeyhash"
                    },
                    "spentTxId": null,
                    "spentIndex": null,
                    "spentHeight": null
                }
            ],
            "blockhash": "00000000000ceac1daf4960aed0baf915bf4d5c8bde9953fe1f255479344fe99",
            "blockheight": 1452333,
            "confirmations": 1085,
            "time": 1547448785,
            "blocktime": 1547448785,
            "valueOut": 0.7420908,
            "size": 225,
            "valueIn": 0.7421908,
            "fees": 0.0001
        },
        {
            "txid": "174717f368c509b49f6d29fa43c5be41ae63caed18884ee49013f71bfc2bf602",
            "version": 2,
            "locktime": 0,
            "vin": [
                {
                    "txid": "4dd7415db5cfc9f5745586dd35f36106b61ebbae10dc6ef72547d8023ea73b2f",
                    "vout": 1,
                    "sequence": 4294967295,
                    "n": 0,
                    "scriptSig": {
                        "hex": "483045022100923e1e53684164886a642cfe9d2c17112f94ff7a2ac6122cad0d4e642c6455b402207dec3292b9c53e324c013b9de7525cce592fe0a0354b7409298b2db84c59de990121032fb38c13a299a8548d065dad2e7b8adb50a44de5142986725182231af4320462",
                        "asm": "3045022100923e1e53684164886a642cfe9d2c17112f94ff7a2ac6122cad0d4e642c6455b402207dec3292b9c53e324c013b9de7525cce592fe0a0354b7409298b2db84c59de99[ALL] 032fb38c13a299a8548d065dad2e7b8adb50a44de5142986725182231af4320462"
                    },
                    "addr": "mpzWaUfQCBm4cRazYQ13WVSg8yMHAwBj8z",
                    "valueSat": 80000,
                    "value": 0.0008,
                    "doubleSpentTxID": null
                }
            ],
            "vout": [
                {
                    "value": "0.00010000",
                    "n": 0,
                    "scriptPubKey": {
                        "hex": "76a914247a70b8f5e1ef39326273710a26b8da4750749988ac",
                        "asm": "OP_DUP OP_HASH160 247a70b8f5e1ef39326273710a26b8da47507499 OP_EQUALVERIFY OP_CHECKSIG",
                        "addresses": [
                            "miqqJGBoxoPxjY9Kpe4dCKqmNfeuYD55gE"
                        ],
                        "type": "pubkeyhash"
                    },
                    "spentTxId": null,
                    "spentIndex": null,
                    "spentHeight": null
                },
                {
                    "value": "0.00060000",
                    "n": 1,
                    "scriptPubKey": {
                        "hex": "76a91467ef4fc887be76a8c1d1f29e0c555ab05d44a00a88ac",
                        "asm": "OP_DUP OP_HASH160 67ef4fc887be76a8c1d1f29e0c555ab05d44a00a OP_EQUALVERIFY OP_CHECKSIG",
                        "addresses": [
                            "mpzWaUfQCBm4cRazYQ13WVSg8yMHAwBj8z"
                        ],
                        "type": "pubkeyhash"
                    },
                    "spentTxId": null,
                    "spentIndex": null,
                    "spentHeight": null
                }
            ],
            "blockhash": "00000000000000b18cbac4b395d84082eba5d36b5e61e130a82d5379f91008dd",
            "blockheight": 1452306,
            "confirmations": 1112,
            "time": 1547436625,
            "blocktime": 1547436625,
            "valueOut": 0.0007,
            "size": 226,
            "valueIn": 0.0008,
            "fees": 0.0001
        },
        {
            "txid": "4dd7415db5cfc9f5745586dd35f36106b61ebbae10dc6ef72547d8023ea73b2f",
            "version": 2,
            "locktime": 0,
            "vin": [
                {
                    "txid": "edd4a84590e1e83d5410c3397b83eaa35fc8e18dc8404f2d5734821510a3d09e",
                    "vout": 0,
                    "sequence": 4294967295,
                    "n": 0,
                    "scriptSig": {
                        "hex": "483045022100ac53f439a5a8964739c66244e4536890ee06898bce9c58eb3ced453e555cb9de022006a52acb3dbeb17e96c7fe155892b14ade1e436d78bee62a279827f3af2f51060121032fb38c13a299a8548d065dad2e7b8adb50a44de5142986725182231af4320462",
                        "asm": "3045022100ac53f439a5a8964739c66244e4536890ee06898bce9c58eb3ced453e555cb9de022006a52acb3dbeb17e96c7fe155892b14ade1e436d78bee62a279827f3af2f5106[ALL] 032fb38c13a299a8548d065dad2e7b8adb50a44de5142986725182231af4320462"
                    },
                    "addr": "mpzWaUfQCBm4cRazYQ13WVSg8yMHAwBj8z",
                    "valueSat": 100000,
                    "value": 0.001,
                    "doubleSpentTxID": null
                }
            ],
            "vout": [
                {
                    "value": "0.00010000",
                    "n": 0,
                    "scriptPubKey": {
                        "hex": "76a914247a70b8f5e1ef39326273710a26b8da4750749988ac",
                        "asm": "OP_DUP OP_HASH160 247a70b8f5e1ef39326273710a26b8da47507499 OP_EQUALVERIFY OP_CHECKSIG",
                        "addresses": [
                            "miqqJGBoxoPxjY9Kpe4dCKqmNfeuYD55gE"
                        ],
                        "type": "pubkeyhash"
                    },
                    "spentTxId": null,
                    "spentIndex": null,
                    "spentHeight": null
                },
                {
                    "value": "0.00080000",
                    "n": 1,
                    "scriptPubKey": {
                        "hex": "76a91467ef4fc887be76a8c1d1f29e0c555ab05d44a00a88ac",
                        "asm": "OP_DUP OP_HASH160 67ef4fc887be76a8c1d1f29e0c555ab05d44a00a OP_EQUALVERIFY OP_CHECKSIG",
                        "addresses": [
                            "mpzWaUfQCBm4cRazYQ13WVSg8yMHAwBj8z"
                        ],
                        "type": "pubkeyhash"
                    },
                    "spentTxId": "174717f368c509b49f6d29fa43c5be41ae63caed18884ee49013f71bfc2bf602",
                    "spentIndex": 0,
                    "spentHeight": 1452306
                }
            ],
            "blockhash": "000000000000d90dad490a4c0a42612bf705e686807345efc03ee2dedf590801",
            "blockheight": 1452051,
            "confirmations": 1367,
            "time": 1547280748,
            "blocktime": 1547280748,
            "valueOut": 0.0009,
            "size": 226,
            "valueIn": 0.001,
            "fees": 0.0001
        },
        {
            "txid": "edd4a84590e1e83d5410c3397b83eaa35fc8e18dc8404f2d5734821510a3d09e",
            "version": 2,
            "locktime": 0,
            "vin": [
                {
                    "txid": "787e73d9b7554ec9980584c84ec89335a56a822c532d11a331da7881f13d03b7",
                    "vout": 1,
                    "sequence": 4294967295,
                    "n": 0,
                    "scriptSig": {
                        "hex": "47304402207c7c2e18e822caebc871dcd193afbe1def93ebaa5b3322e4b83877402fb1b45002200fb78337e5f19f6f55441d2519b39352b0f95e0183e164162c2c9bb6b872ebcd012102b3e7c21a906433171cad38589335002c34a6928e19b7798224077c30f03e835e",
                        "asm": "304402207c7c2e18e822caebc871dcd193afbe1def93ebaa5b3322e4b83877402fb1b45002200fb78337e5f19f6f55441d2519b39352b0f95e0183e164162c2c9bb6b872ebcd[ALL] 02b3e7c21a906433171cad38589335002c34a6928e19b7798224077c30f03e835e"
                    },
                    "addr": "miqqJGBoxoPxjY9Kpe4dCKqmNfeuYD55gE",
                    "valueSat": 85349080,
                    "value": 0.8534908,
                    "doubleSpentTxID": null
                }
            ],
            "vout": [
                {
                    "value": "0.00100000",
                    "n": 0,
                    "scriptPubKey": {
                        "hex": "76a91467ef4fc887be76a8c1d1f29e0c555ab05d44a00a88ac",
                        "asm": "OP_DUP OP_HASH160 67ef4fc887be76a8c1d1f29e0c555ab05d44a00a OP_EQUALVERIFY OP_CHECKSIG",
                        "addresses": [
                            "mpzWaUfQCBm4cRazYQ13WVSg8yMHAwBj8z"
                        ],
                        "type": "pubkeyhash"
                    },
                    "spentTxId": "4dd7415db5cfc9f5745586dd35f36106b61ebbae10dc6ef72547d8023ea73b2f",
                    "spentIndex": 0,
                    "spentHeight": 1452051
                },
                {
                    "value": "0.85239080",
                    "n": 1,
                    "scriptPubKey": {
                        "hex": "76a914247a70b8f5e1ef39326273710a26b8da4750749988ac",
                        "asm": "OP_DUP OP_HASH160 247a70b8f5e1ef39326273710a26b8da47507499 OP_EQUALVERIFY OP_CHECKSIG",
                        "addresses": [
                            "miqqJGBoxoPxjY9Kpe4dCKqmNfeuYD55gE"
                        ],
                        "type": "pubkeyhash"
                    },
                    "spentTxId": "cce853d1947a48c117abd97597281f5df2a4b6ac0b71ec70b24b2e63d7504644",
                    "spentIndex": 0,
                    "spentHeight": 1452333
                }
            ],
            "blockhash": "00000000000000d83543e1ca7a26228f669702de1cf2fd39f681474da01666c2",
            "blockheight": 1452045,
            "confirmations": 1373,
            "time": 1547277052,
            "blocktime": 1547277052,
            "valueOut": 0.8533908,
            "size": 225,
            "valueIn": 0.8534908,
            "fees": 0.0001
        }
    ]
};
const words = 'seminar worry dune habit online shine mountain idle video range drift object similar north supreme oxygen evidence peace lift decade affair trip mother celery';
// const words = 'skull power tissue west travel visa raw regret turn cash cloth manage finish spare magic thought crack crush trumpet pill comfort short cable screen';
const btcW = wallet.createEncrypt(words, '1', '1');
console.log(btcW['btc-testnet']);

const tx = wallet.txSign('btc-testnet', {
    utxo: data.txs,
    privateKey: wallet.decryptKey(btcW['btc-testnet'].privateKey, '1'),
    to: 'my5iM2LLT3S6nKKujZG4HTZe93MkKv5UY3',
    value: 0.001,
    fees: 0.00001
});
console.log(tx);