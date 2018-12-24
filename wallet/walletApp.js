const hlc = require('./../src/hlc');
const btc = require('./../src/btc');
const phlc = require('./wallet-hlc')
const pbtc = require('./wallet-btc')
const bip39 = require('bip39');
const crypto = require('crypto');

module.exports = {
    create,
    txsign,
    fromMnemonic,
    toMnemonic
};

function create(password, type, rngHex) {
    const rng = function() {
        return Buffer.from(rngHex, 'hex');
    };

    const mnemonic = bip39.generateMnemonic(96, rng);
    const entropy = bip39.mnemonicToEntropy(mnemonic);
    const wallet  = Wallet(entropy, type);
    return {
        "address": wallet.address,
        "value": wallet.encrypt(password)
    }
};

function txsign() {

};

function fromMnemonic(password, type, mnemonic) {
    if (!bip39.validateMnemonic(mnemonic)) {
        return false;
    }
    const wallet = Wallet(bip39.mnemonicToEntropy(mnemonic), type);
    return {
        "address": wallet.address,
        "value": wallet.encrypt()
    }
};

function toMnemonic(password, value) {
    const wallet = Wallet.decrypt(password, value);
    if (typeof (wallet) === 'boolean') {
        return wallet
    }
    return wallet.mnemonic;
};

function Wallet(entropy, type) {
    this.encrypt = entropy;
    this.chainType = type;

    let ec = null;
    switch (type) {
        case 'BTC':
            ec = btc.ec.fromEntropy(entropy);
            break;
        default:
            ec = hlc.ec.fromEntropy(entropy);
            break;
    }
    this.__priv = ec.privateKey;
    this.__pub = ec.publicKey;
}

Object.defineProperty(Wallet.prototype, 'mnemonic', {
    enumerable: false,
    get: function () {
        return bip39.entropyToMnemonic(this.__priv.toString('hex'));
    }
});

Object.defineProperty(Wallet.prototype, 'address', {
    get: function () {
        return ec.toAddress(this.__pub);
    }
});

Wallet.prototype.encrypt = function (password) {
    const json = {
        chainType: this.chainType,
        mnemonic: bip39.entropyToMnemonic(this.__priv.toString('hex'))
    };
    return JSON.stringify(json).cipher(password.toMD5());
};

Wallet.decrypt = function (password, value) {
    value = value.decipher(password.toMD5());
    if (typeof (value) === 'boolean') {
        return false
    }

    value = JSON.parse(value);
    return Wallet(bip39.mnemonicToEntropy(value.mnemonic), value.chainType);
};

Wallet.prototype.txsign = function (utxos, to, value, fees) {
    switch (this.chainType) {
        case 'BTC':
            return pbtc.txSign(utxos, this.__priv, to, value, fees);
        default:
            return phlc.txSign(utxos, this.__priv, to, value, fees);
    }
};

String.prototype.toMD5 = function () {
    const md5 = crypto.createHash('md5');
    md5.update(this);
    return md5.digest('hex');
};

String.prototype.cipher = function (password) {
    const cyo = crypto.createCipher('aes-256-cbc', password);
    let result = cyo.update(this, 'htf8', 'hex');
    result += cyo.final('hex');
    return result;
};

String.prototype.decipher = function (password) {
    const cyo = crypto.createDecipher('aes-256-cbc', password);
    let result = cyo.update(this, 'hex', 'utf8');
    try {
        result += cyo.final('utf8');
    } catch (e) {
        return '';
    }
    return result;
};