const hlc = require('./../src/hlc');
const btc = require('./../src/btc');
const bip39 = require('bip39');
const crypto = require('crypto');

module.exports = {
    create,
    txSign,
    fromMnemonic,
    toMnemonic
};

function create(random, type, password) {
    let rng = () => {
        return Buffer.from(random, 'hex');
    };
    const mnemonic = bip39.generateMnemonic(18, rng);
    return fromMnemonic(mnemonic, password);
}

function toMnemonic(value, password) {
    return Wallet.decrypt(value, password).mnemonic;
}

function fromMnemonic(mnemonic, type, password) {

    if (bip39.validateMnemonic(mnemonic)) {
        return false;
    }

    const entropy = bip39.mnemonicToEntropy(mnemonic);
    const wallet = Wallet(entropy, type, password);

    return {
        "key": wallet.address,
        "value": wallet.encrypt(password)
    };
}

function txSign() {

}

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
    get: function(){
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

Wallet.prototype.decrypt = function (value, password) {
    value = value.decipher(password.toMD5());
    if (typeof (value) === 'boolean') {
        return false
    }

    value = JSON.parse(value);
    return Wallet(bip39.mnemonicToEntropy(value.mnemonic), value.chainType);
};

Wallet.prototype.txsign = function () {

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