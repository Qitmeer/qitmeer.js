const bip39 = require('bip39');
const ec = require('./ec');
const _txsign = require('./txsign');
const _address = require('./address');
const config = require('./config');
const ajax = require('./../_tools/ajax');


const _network = config.privnet;

class HLC {
    static getInstance() {
        if (!HLC.instance) {
            HLC.instance = new HLC();
        }
        return HLC.instance;
    };

    constructor({words, options, encryptPwd}) {
        this.path = options.path || _network.path;
        this.network = options.network || _network.network;
        this.encryptPwd = encryptPwd;
        return this.init(words);
    }

    init(words) {
        const privateHex = bip39.mnemonicToEntropy(words);
        const keyPair = ec.fromPrivateKey(Buffer.from(privateHex, 'hex'), {
            network: this.network
        });
        const address = _address.ecPubKeyToAddress(keyPair.publicKey, this.network.pubKeyHashAddrId);
        let privateKey = keyPair.toWIF();
        if (this.encryptPwd) privateKey = privateKey.encrypt(this.encryptPwd);
        return {
            address: 'h' + address,
            privateKey: privateKey
        }
    }

    static async txSign({privateKey, to, value, fees, success, error}, options) {
        const config = options.config;
        const keyPair = ec.fromWIF(privateKey);
        const from = _address.ecPubKeyToAddress(keyPair.publicKey, config.network.pubKeyHashAddrId);
        const txb = _txsign.newSigner();
        // txb.setVersion(network.pubKeyHashAddrId);
        txb.setVersion(1);

        const utxo = await getUtxoArr('h' + from, config);

        const fullValue = parseFloat(value) * 100000000;
        const fullFees = parseFloat(fees) * 100000000;

        let [total, utxoArr] = [0, []];
        for (let i = 0, len = utxo.length; total < (fullValue + fullFees) && i < len; i++) {
            total += utxo[i].amount;
            utxoArr.push(utxo[i]);
            txb.addInput(utxo[i].txid, utxo[i].vout)
        }
        //去掉前面的小h
        to = to.substring(1, to.length);

        txb.addOutput(to, fullValue);
        const balance = total - fullValue - fullFees;
        if (balance > 0) {
            txb.addOutput(from, balance)
        } else {
            return -1
        }

        for (let i = 0, len = utxoArr.length; i < len; i++) {
            txb.sign(i, keyPair)
        }

        const tx = txb.build().toBuffer().toString('hex');
        const data = await postSendTx(tx, config);
        if (data.code === 0) {
            if (success) success(data)
        } else {
            if (error) error(data)
        }
    }

    static async getBalance(address, success, options) {
        const data = await getBalance(address, options.config);
        if (success) success(data);
    }
}

async function getUtxoArr(address, config) {
    //去掉小h
    address = address.substring(1, address.length);
    const data = await ajax.Get(config.getUtxoArr, {address: address});
    return data.result;
}

async function postSendTx(tx, config) {
    return await ajax.Post(config.postSendTx, {tx: tx});
}

async function getBalance(address, config) {
    const data = await getUtxoArr(address, config);
    let total = 0;
    data.forEach(utxo => {
        total += parseFloat(utxo.amount);
    });
    if (total > 0) total = total / 100000000;
    return total;
}

module.exports = HLC;