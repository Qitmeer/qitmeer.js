const wif = require('wif');
const bip39 = require('bip39');
const bip32 = require('bip32');
const config = require('./config');

const bitcoin = require('bitcoinjs-lib');

class BTC {
    static getInstance() {
        if (!BTC.instance) {
            BTC.instance = new BTC();
        }
        return BTC.instance;
    };

    constructor({words, options, encryptPwd}) {
        this.path = options.path;
        this.network = options.network;
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


    static txSign({utxo, privateKey, to, value, fees}, options) {
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, options.network);
        const from = toAddress(keyPair.publicKey, options.network);
        const txb = new bitcoin.TransactionBuilder(options.network);
        utxo = formatUtxo(utxo, from);
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

function formatUtxo(data, address) {
    let utxoArr = [];
    data.map(v => {
        const vout = v.vout;
        vout.map((v1, i) => {
            if (address === v1.scriptPubKey.addresses[0] && v1.spentTxId === null) {
                utxoArr.push({
                    txid: v.txid,
                    vout: i,
                    amount: (v1.value * 100000000).toFixed(0)
                });
            }
        })
    });
    return utxoArr;
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