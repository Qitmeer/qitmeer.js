const hash = require('../_tools/hash');
const nox58check = require('./nox58check').default;
const bip39 = require('bip39');
const ec = require('./ec');
const txsign = require('./txsign');
const _address = require('./address');
const config = require('./config');


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
            address: address,
            privateKey: privateKey
        }
    }

    static txSign({utxo, privateKey, to, value, fees}, options) {
        const keyPair = ec.fromWIF(privateKey);
        const from = _address.ecPubKeyToAddress(keyPair.publicKey, options.network.pubKeyHashAddrId);
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