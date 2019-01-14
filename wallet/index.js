const randomBytes = require('randomBytes');
const btc = require('./btc/index');
const hlc = require('./hlc/index');
const eth = require('./eth/index');

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
            btc: new btc().keyPair(words),
            hlc: new hlc().keyPair(words),
            eth: new eth().keyPair(words),
            hlcToken:{}
        }
    }
}