const bip39 = require('bip39');
const btc = require('./btc/index');
const hlc = require('./hlc/index');
const eth = require('./eth/index');
const crypto = require('crypto');

class Wallet {

    constructor(mnemonic, password) {
        let bitcoin = btc.keyPair(mnemonic);
        let halalChain = hlc.keyPair(mnemonic);
        let ethereum = eth.keyPair(mnemonic);
        return {
            "btc": bitcoin,
            "hlc": halalChain,
            "eth": ethereum
        };
    }

    static create(entropy, password) {
        let mnemonic = bip39.generateMnemonic(128, () => { return Buffer.from(entropy, "hex"); });
        return new Wallet(mnemonic, password);
    }

    static fromMnemonic(mnemonic, password) {
        return new Wallet(mnemonic, password);
    }

    toMnemonic(value, password) {
        return "";
    }
}

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