const wif = require('wif');
const bip39 = require('bip39');
const bip32 = require('bip32');
const bs58check = require('bs58check');
// const hash = require('./../hash');

// const networks = require('./networks');
// const ec = require('./ec');

const bitcoin = require('bitcoinjs-lib');

const _network = bitcoin.networks.bitcoin;
// const _network = bitcoin.networks.testnet;

class BTC {
    static getInstance() {
        if (!BTC.instance) {
            BTC.instance = new BTC();
        }
        return BTC.instance;
    };

    constructor() {
    }

    static keyPair(words) {
        // const path = "m/44'/1'/0'/0/0";
        const path = "m/44'/0'/0'/0/0";
        const seed = bip39.mnemonicToSeed(words);
        const root = bip32.fromSeed(seed, _network);
        const keyPair = root.derivePath(path);
        // const address = toAddress(keyPair.publicKey, _network.pubKeyHash);
        const address = toAddress(keyPair.publicKey, _network);
        const privateKey = toWIF(keyPair.privateKey);
        return {
            address: address,
            privateKey: privateKey
        }
    }

    static txSign(utxo, privateKey, to, value, fees) {
        // const keyPair = ec.fromWIF(privateKey, _network);
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, _network);

        // const from = toAddress(keyPair.publicKey, _network.pubKeyHash);
        const from = toAddress(keyPair.publicKey, _network);
        // const txb = new btc.TransactionBuilder(_network);
        const txb = new bitcoin.TransactionBuilder(_network);

        const fullValue = parseFloat(value) * 100000000;
        const fullFees = parseFloat(fees) * 100000000;

        let [total, utxoArr] = [0, []];
        for (let i = 0, len = utxo.length; total < (fullValue + fullFees) && i < len; i++) {
            total += utxo[i].amount;
            utxoArr.push(utxo[i]);
            txb.addInput(utxo[i].txid, utxo[i].vout);
        }

        txb.addOutput(to, fullValue);
        const balance = total - fullValue - fullFees;
        if (balance > 0) {
            txb.addOutput(from, balance);
        } else {
            return -1;
        }

        for (let i = 0, len = utxoArr.length; i < len; i++) {
            txb.sign(i, keyPair);
        }

        return txb.build().toHex();
    }

}

function toAddress(publicKey, network) {
    return bitcoin.payments.p2pkh({
        pubkey: publicKey,
        network: network
    }).address;
}

//
// /**
//  * 生成地址
//  * @param publicKey 公钥 buffer
//  * @param version 版本
//  * @returns {*}
//  */
// function toAddress(publicKey, version) {
//     let v = Buffer.alloc(1);
//     v.writeUInt8(version, 0);
//     const hash160 = hash.rmd160B_sha256B(publicKey);
//     const concatBuffer = Buffer.concat([v, hash160]);
//     return bs58check.encode(concatBuffer);
// }
//
/**
 * WIF私钥
 * @param privateKey ec私钥
 * @param network 版本
 * @returns {*}
 */
function toWIF(privateKey, network) {
    network = network || _network;
    return wif.encode(network.wif, privateKey, true);
}

module.exports = BTC;