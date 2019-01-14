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

    constructor() {
    }


    static keyPair(words) {
        // const seed = bip39.mnemonicToSeed(words);
        // const root = bip32.fromSeed(seed);
        // const keyPair = root.derivePath(this.path);
        const privateHex = bip39.mnemonicToEntropy(words);
        const keyPair = ec.fromPrivateKey(Buffer.from(privateHex, 'hex'), {
            network: _network
        });

        const address = _address.ecPubKeyToAddress(keyPair.publicKey, _network.pubKeyHashAddrId);
        const privateKey = keyPair.toWIF();
        return {
            address: address,
            privateKey: privateKey
        }
    }


    static txSign(utxo, privateKey, to, value, fees) {
        const keyPair = ec.fromWIF(privateKey);
        const from = _address.ecPubKeyToAddress(keyPair.publicKey, _network.pubKeyHashAddrId);
        const txb = txsign.newSigner();
        // txb.setVersion(_network.pubKeyHashAddrId);
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