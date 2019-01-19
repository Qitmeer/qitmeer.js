const wif = require('wif');
const bip39 = require('bip39');
const bip32 = require('bip32');

const bitcoin = require('bitcoinjs-lib');

class BTC {
    static getInstance() {
        if (!BTC.instance) {
            BTC.instance = new BTC();
        }
        return BTC.instance;
    };

    constructor({words, options, encryptPwd}) {
        const main = BTC.mainnet();
        this.path = options.path || main.path;
        this.network = options.network || main.network;
        this.encryptPwd = encryptPwd;
        return this.init(words);
    }

    init(words) {
        const seed = bip39.mnemonicToSeed(words);
        const root = bip32.fromSeed(seed, this.network);
        const keyPair = root.derivePath(this.path);
        const address = toAddress(keyPair.publicKey, this.network);
        let privateKey = toWIF(keyPair.privateKey, this.network);
        if (this.encryptPwd) privateKey = privateKey.encrypt(this.encryptPwd);
        return {
            address: address,
            privateKey: privateKey
        }
    }

    //主网
    static mainnet() {
        const network = bitcoin.networks.bitcoin;
        const path = "m/44'/0'/0'/0/0";
        return {
            network: network,
            path: path
        }
    }

    //测试网
    static testnet() {
        const network = bitcoin.networks.testnet;
        const path = "m/44'/1'/0'/0/0";
        return {
            network: network,
            path: path
        }
    }

    static txSign({utxo, privateKey, to, value, fees}, network) {
        // const keyPair = ec.fromWIF(privateKey, network);
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);

        // const from = toAddress(keyPair.publicKey, network.pubKeyHash);
        const from = toAddress(keyPair.publicKey, network);
        // const txb = new btc.TransactionBuilder(network);
        const txb = new bitcoin.TransactionBuilder(network);

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

/**
 * WIF私钥
 * @param privateKey ec私钥
 * @param network 版本
 * @returns {*}
 */
function toWIF(privateKey, network) {
    return wif.encode(network.wif, privateKey, true);
}

module.exports = BTC;