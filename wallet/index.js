const randomBytes = require('randomBytes');
const btc = require('./btc/index');
const hlc = require('./hlc/index');
const eth = require('./eth/index');

module.exports = Wallet;

class Wallet {
    static getInstance() {
        if (!Wallet.instance) {
            Wallet.instance = new Wallet();
        }
        return Wallet.instance;
    };

    constructor() {

    }

    static create(password, tips) {
        const x = randomBytes(32);
        const words = bip39.entropyToMnemonic(x);
        return {
            words: words,
            tips: tips,
            btc:  btc.keyPair(words),
            hlc:  hlc.keyPair(words),
            eth:  eth.keyPair(words),
            hlcToken: {}
        }
    }
}