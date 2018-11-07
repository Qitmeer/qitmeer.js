const nox = require('./src');
const bip39 = require('bip39');

const _network = nox.networks.privnet;

const _public = {};

_public.importWIF = (wif) => {
    const ec = nox.ec.fromWIF(wif);
    return wallet(ec);
};

_public.importWords = (words) => {
    const privHex = bip39.mnemonicToEntropy(words);
    const privBuf = Buffer.from(privHex, 'hex');
    const ec = nox.ec.fromPrivateKey(privBuf);
    return wallet(ec);
};

_public.exportWIF = (privHex) => {
    const privBuf = Buffer.from(privHex, 'hex');
    const ec = nox.ec.fromPrivateKey(privBuf);
    return ec.toWIF();
};

_public.exportWords = (privHex) => {
    const privBuf = Buffer.from(privHex, 'hex');
    return bip39.entropyToMnemonic(privBuf);
};

_public.create = (random) => {
    let rng = () => {
        return Buffer.from(random, 'hex');
    };

    let ec = nox.ec.fromEntropy({
        rng: rng,
        network: _network
    });
    return wallet(ec);
};

const wallet = (ec) => {
    return {
        priveKey: ec.privateKey.toString('hex'),
        pubKey: ec.publicKey.toString('hex'),
        address: generateAddress(ec.publicKey.toString("hex"))
    };
};

const generateAddress = (pubKey) => {
    const ad = require('./address');
    return ad.generateHlcAddress(pubKey);
};


module.exports = _public;