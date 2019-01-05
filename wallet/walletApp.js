const hlc = require('./../src/hlc');
const pubHLC = require('./wallet-hlc');
const btc = require('./../src/btc');
const pubBTC = require('./wallet-btc');
const bip39 = require('bip39');
const crypto = require('crypto');

const walletTypes = ["Bitcoin", "HalalChain"];

module.exports = {
    create,
    transaction,
    fromMnemonic,
    toMnemonic
};

function create(password, entropy) {
    const wallets = [];
    walletTypes.forEach(item => {
        const wallet = new Wallet(entropy, item);
        wallets.push({
            "address": wallet.address,
            "chainType": wallet.chainType,
            "value": wallet.encrypt(password)
        });
    });
    return wallets;
}

function transaction(password, value, data) {
    data = typeof (data) === 'string' ? JSON.parse(data) : data;
    const wallet = Wallet.decrypt(password, value);

    if (typeof (wallet) === 'boolean') {
        return wallet
    }
    return wallet.txSign(data.utxos, data.to, data.value, data.fees);
}

function fromMnemonic(password, mnemonic) {

    if (!bip39.validateMnemonic(mnemonic)) {
        return false;
    }

    const wallets = [];
    walletTypes.forEach(item => {
        const wallet = new Wallet(bip39.mnemonicToEntropy(mnemonic), item);
        wallets.push({
            "address": wallet.address,
            "chainType": wallet.chainType,
            "value": wallet.encrypt(password)
        });
    });
    return wallets;
}

function toMnemonic(password, value) {
    const wallet = Wallet.decrypt(password, value);

    if (typeof (wallet) === 'boolean') {
        return wallet
    }
    return wallet.mnemonic;
}

class Wallet {

    constructor(entropy, type) {
        const rng = () => {
            return Buffer.from(entropy, 'hex');
        };
        let ec = null;
        switch (type) {
            case 'Bitcoin':
                ec = btc.ec.fromEntropy({ rng: rng });
                this.__wif = btc.ec.toWIF(ec);
                break;
            default:
                ec = hlc.ec.fromEntropy({ rng: rng });
                this.__wif = hlc.ec.toWIF(ec);
                break;
        }
        this.chainType = type;
        this.__priv = ec.privateKey;
        this.__pub = ec.publicKey;
    }

    txSign(utxos, to, value, fees) {
        switch (this.chainType) {
            case 'Bitcoin':
                return pubBTC.txSign(utxos, this.__wif, to, value, fees);
            default:
                return pubHLC.txSign(utxos, this.__wif, to, value, fees);
        }
    }

    encrypt(password) {
        const json = {
            chainType: this.chainType,
            mnemonic: bip39.entropyToMnemonic(this.__priv.toString('hex'))
        };
        return JSON.stringify(json).cipher(password.toMD5());
    }

    static decrypt(password, value) {
        value = value.decipher(password.toMD5());
        if (typeof (value) === 'boolean') {
            return false;
        }
        value = JSON.parse(value);
        return new Wallet(bip39.mnemonicToEntropy(value.mnemonic), value.chainType);
    }
}

Object.defineProperty(Wallet.prototype, 'mnemonic', {
    enumerable: false,
    get: function () {
        return bip39.entropyToMnemonic(this.__priv.toString('hex'));
    }
});

Object.defineProperty(Wallet.prototype, 'address', {
    get: function () {
        switch (this.chainType) {
            case 'Bitcoin':
                return pubBTC.toAddress(this.__pub);
            default:
                return pubHLC.toAddress(this.__pub);
        }
    }
});

Object.assign(String.prototype, {
    toMD5() {
        return crypto.createHash('md5').update(this.valueOf()).digest('hex');
    },
    cipher(password) {
        password = password.toMD5();
        const cyo = crypto.createCipher('aes-256-cbc', password);
        let result = cyo.update(this.valueOf(), 'utf8', 'hex');
        result += cyo.final('hex');
        return result;
    },
    decipher(password) {
        password = password.toMD5();
        const cyo = crypto.createDecipher('aes-256-cbc', password);
        let result = cyo.update(this.valueOf(), 'hex', 'utf8');
        try {
            result += cyo.final('utf8');
        } catch (e) {
            return false;
        }
        return result;
    }
});