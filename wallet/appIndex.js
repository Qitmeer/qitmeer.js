const bip39 = require('bip39');
const btc = require('./btc/index');
const eth = require('./eth/index');
const hlc = require('./hlc/index');
const crypto = require('_tools/crypto');

class Wallet {

    constructor(mnemonic, password) {
        let btcMain = new btc({ words: mnemonic, encryptPwd: password.toMD5(), path: btc.mainnet().path, network: btc.mainnet().network });
        let btcTest = new btc({ words: mnemonic, encryptPwd: password.toMD5(), path: btc.testnet().path, network: btc.testnet().network });
        let ethMain = new eth({ words: mnemonic, encryptPwd: password.toMD5(), path: eth.mainnet().path, network: eth.mainnet().network });
        let ethTest = new eth({ words: mnemonic, encryptPwd: password.toMD5(), path: eth.testnet().path, network: eth.testnet().network });
        let hlcTest = new hlc({ words: mnemonic, encryptPwd: password.toMD5(), path: hlc.privnet().path, network: hlc.privnet().network });
        return {
            "Mnemonic": mnemonic.encrypt(password),
            "Bitcoin": [
                { "BTC": btcMain },
                { "BTC-Testnet": btcTest }
            ],
            "Ethereum": [
                { "ETH": ethMain },
                { "ETH-Ropsten": ethTest }
            ],
            "HalalChain": [
                { "HalalChain": hlcTest }
            ]
        }
    }

    transaction(privKey, data, chainType) {
        if (typeof data === "string") {
            data = JSON.parse(data);
        }
    }

    static create(password, entropy) {
        let mnemonic = bip39.generateMnemonic(128, () => { return Buffer.from(entropy, "hex"); });
        return new Wallet(mnemonic, password);
    }

    static fromMnemonic(password, mnemonic) {
        if (!bip39.validateMnemonic(mnemonic)) {
            return "Incorrect Mnemonic Phrase";
        }
        return new Wallet(mnemonic, password);
    }
}

module.exports = Wallet;

Object.assign(String.prototype, {
    toMD5() {
        return crypto.createHash("md5").update(this.valueOf()).digest('hex');
    },
    encrypt(password) {
        let result = "";
        const cipher = crypto.createCipheriv("aes-128-cbc", Buffer.from(password.toMD5(), "hex"), Buffer.from("Wallet App".toMD5(), "hex"));
        result += cipher.update(this.valueOf(), "utf8", "hex");
        result += cipher.final("hex");
        return result;
    },
    decrypt(password) {
        let result = "";
        const cipher = crypto.createDecipheriv("aes-128-cbc", Buffer.from(password.toMD5(), "hex"), Buffer.from("Wallet App".toMD5(), "hex"));
        result += cipher.update(this.valueOf(), "hex", "utf8");
        result += cipher.final("utf8");
        return result;
    }
});