const wif = require('wif');
const bip39 = require('bip39');
const bip32 = require('bip32');
const ajax = require('./../_tools/ajax');

const bitcoin = require('bitcoinjs-lib');

class BTC {
    static getInstance() {
        if (!BTC.instance) {
            BTC.instance = new BTC();
        }
        return BTC.instance;
    };

    constructor({words, options, encryptPwd}) {
        const config = options.config;
        this.path = config.path;
        this.network = config.network;
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


    static async txSign({privateKey, to, value, fees, success, error}, options) {
        const config = options.config;
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, config.network);
        const from = toAddress(keyPair.publicKey, config.network);
        const txb = new bitcoin.TransactionBuilder(config.network);
        const utxo = await getUtxoArr(from, config);

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

        const tx = txb.build().toHex();
        const data = await postSendTx(tx, config);
        if (data.txid) {
            if (success) success(data);
        } else {
            if (error) error(data);
        }
    }

    static async getBalance(address, success, options) {
        const data = await getBalance(address, options.config);
        if (success) success(data.balance);
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

async function getUtxoArr(address, config) {
    const data = await ajax.Get(config.getUtxoArr, {address: address});
    return formatUtxo(data.txs, address)
}

async function postSendTx(tx, config) {
    return await ajax.Post(config.postSendTx, {rawtx: tx});
}

async function getBalance(address, config) {
    return await ajax.Get(config.getBalance, {address: address});
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