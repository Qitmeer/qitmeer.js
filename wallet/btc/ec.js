const secp256k1 = require('tiny-secp256k1');
const randomBytes = require('randombytes');
const wif = require('wif');
//
const _network = require('./networks').bitcoin;

module.exports = {
    create,
    fromEntropy,
    fromPrivateKey,
    fromPublicKey,
    fromWIF
};


function EC(priv, pub, options) {
    options = options || {};
    this.compressed = options.compressed === undefined ? true : options.compressed;
    this.network = options.network;

    this.__priv = priv || null;
    this.__pub = null;
    if (pub) this.__pub = secp256k1.pointCompress(pub, this.compressed);
}

Object.defineProperty(EC.prototype, 'privateKey', {
    enumerable: false,
    get: function () {
        return this.__priv
    }
});

Object.defineProperty(EC.prototype, 'publicKey', {
    get: function () {
        if (!this.__pub) this.__pub = secp256k1.pointFromScalar(this.__priv, this.compressed);
        return this.__pub
    }
});

EC.prototype.toWIF = function () {
    if (!this.__priv) throw new Error('Missing private key');
    return wif.encode(this.__priv, this.compressed)
};

EC.prototype.sign = function (hash) {
    if (!this.__priv) throw new Error('Missing private key');
    return secp256k1.sign(hash, this.__priv)
};

EC.prototype.verify = function (hash, signature) {
    return secp256k1.verify(hash, this.publicKey, signature)
};


function create(x, options) {
    options.network = options.network || _network;
    return fromPrivateKey(x, options)
}

function fromEntropy(options) {
    options = options || {};
    options.network = options.network || _network;
    const rng = options.rng || randomBytes;
    const rngLength = options.rngLength || 32;
    do {
        x = rng(rngLength);
    }
    while (!secp256k1.isPrivate(x));

    return fromPrivateKey(x, options)

}

function fromPrivateKey(buffer, options) {
    options.network = options.network || _network;
    if (!secp256k1.isPrivate(buffer)) throw new TypeError('Private key not in range [1, n)');
    return new EC(buffer, null, options)
}

function fromPublicKey(buffer, options) {
    options.network = options.network || _network;
    return new EC(null, buffer, options)
}

function fromWIF(string, network) {
    const keyPair = wif.decode(string);
    return fromPrivateKey(keyPair.privateKey, {
        compressed: keyPair.compressed,
        network: network
    });
}