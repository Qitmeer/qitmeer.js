const hash = require('./../hash');
const nox58check = require('./nox58check').default;
const bip39 = require('bip39');
const networks = require('./networks');
const ec = require('./ec');
const txsign = require('./txsign');
const _address = require('./address');


const _network = networks.privnet;

class HLC {
    static getInstance() {
        if (!HLC.instance) {
            HLC.instance = new HLC();
        }
        return HLC.instance;
    };

    constructor({words, encryptPwd, path, network}) {
        const main = HLC.mainnet();
        this.path = path || main.path;
        this.network = network || main.network;
        this.encryptPwd = encryptPwd;
        return this.init(words);
    }

    init(words) {
        // const seed = bip39.mnemonicToSeed(words);
        // const root = bip32.fromSeed(seed);
        // const keyPair = root.derivePath(this.path);
        const privateHex = bip39.mnemonicToEntropy(words);
        const keyPair = ec.fromPrivateKey(Buffer.from(privateHex, 'hex'), {
            network: this.network
        });
        const address = _address.ecPubKeyToAddress(keyPair.publicKey, this.network.pubKeyHashAddrId);
        let privateKey = keyPair.toWIF();
        if (this.encryptPwd) privateKey = privateKey.encrypt(this.encryptPwd);
        return {
            address: address,
            privateKey: privateKey
        }
    }

    //主网
    static mainnet() {
        const network = networks.mainnet;
        const path = "m/44'/0'/0'/0/0";
        return {
            network: network,
            path: path
        }
    }

    //测试网
    static testnet() {
        const network = networks.testnet;
        const path = "m/44'/1'/0'/0/0";
        return {
            network: network,
            path: path
        }
    }

    //私有网络
    static privnet() {
        const network = networks.privnet;
        const path = "m/44'/1'/0'/0/0";
        return {
            network: network,
            path: path
        }
    }

    static txSign({utxo, privateKey, to, value, fees}, network) {
        const keyPair = ec.fromWIF(privateKey);
        const from = _address.ecPubKeyToAddress(keyPair.publicKey, network.pubKeyHashAddrId);
        const txb = txsign.newSigner();
        // txb.setVersion(network.pubKeyHashAddrId);
        txb.setVersion(1);

        const fullValue = parseFloat(value) * 100000000;
        const fullFees = parseFloat(fees) * 100000000;

        let [total, utxoArr] = [0, []];
        for (let i = 0, len = utxo.length; total < (fullValue + fullFees) && i < len; i++) {
            total += utxo[i].amount;
            utxoArr.push(utxo[i]);
            txb.addInput(utxo[i].txid, utxo[i].vout)
        }

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

        return txb.build().toBuffer().toString('hex')
    }
}


module.exports = HLC;