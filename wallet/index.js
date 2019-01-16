const randomBytes = require('randomBytes');
const cyo = require('./crypto');
const btc = require('./btc/index');
const hlc = require('./hlc/index');
const eth = require('./eth/index');
const bip39 = require('bip39');
new cyo();

class Wallet {
    // static getInstance() {
    //     if (!Wallet.instance) {
    //         Wallet.instance = new Wallet();
    //     }
    //     return Wallet.instance;
    // };

    constructor(password, tips, byte) {
        if (typeof byte !== "number") byte = 32;
        this.byte = byte || 32;
        return Wallet.init({password, tips, byte: this.byte});
    }

    static init({words, password, tips, byte, encryptPwd}) {
        if (!words) {
            const x = randomBytes(byte);
            words = bip39.entropyToMnemonic(x);
        }
        const btcT = btc.testnet();
        const ethT = eth.testnet();
        const hlcP = hlc.privnet();

        const params = {
            'btc':
                new btc({words, encryptPwd}),
            'btc-Testnet':
                new btc({words, encryptPwd, path: btcT.path, network: btcT.network}),
            'eth':
                new eth({words, encryptPwd}),
            'eth-Ropsten':
                new eth({words, encryptPwd, path: ethT.path, network: ethT.network}),
            'hlc-Privnet':
                new hlc({words, encryptPwd, path: hlcP.path, network: hlcP.network}),
            'hlcToken':
                {},
            'tips': tips
        };
        if (!encryptPwd) params['password'] = password;
        if (encryptPwd) words = words.encrypt(encryptPwd);
        params['words'] = words;
        return params;
    }

    static createEncrypt(words, password, tips) {
        return Wallet.init({words, password, tips, encryptPwd: password.toMD5()});
    }
}

module.exports = Wallet;
