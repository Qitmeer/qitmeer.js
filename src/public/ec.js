const secp256k1 = require('tiny-secp256k1')
const randomBytes = require('randombytes')


module.exports = {
    fromEntropy,
    fromPrivateKey,
    fromPublicKey,
    fromWIF
}


function EC(priv, pub, options) {
    options = options || {}

    this.compressed = options.compressed === undefined ? true : options.compressed
    this.network = options.network || network.mainnet

    this.__priv = priv || null
    this.__pub = null
    if (pub) this.__pub = secp256k1.pointCompress(pub, this.compressed)
}

Object.defineProperty(EC.prototype, 'privateKey', {
    enumerable: false,
    get: function () {
        return this.__priv
    }
})

Object.defineProperty(EC.prototype, 'publicKey', {
    get: function () {
        if (!this.__pub) this.pub = secp256k1.pointFromScalar(this.__priv, this.compressed)
        return this.__pub
    }
})



/**
 * 生成随机数
 * @param {json} options {network|rng}
 */
function fromEntropy(options) {
    options = options || {}
    const rng = options.rng || randomBytes
    let x
    do {
        x = rng(32)
    } while (!secp256k1.isPrivate(x))

    return fromPrivateKey(x, options)
}

//生成私钥
function fromPrivateKey(buffer, options) {
    if (!secp256k1.isPrivate(buffer)) throw new TypeError('Private key not in range [1, n)')
    return new EC(buffer, null, options)
}

function fromPublicKey(buffer, options) {
    return new EC(null, buffer, options)
}

/**
 * 根据wif格式转换
 * @param {wif} decoded wif.decode后的参数
 * @param {json} network 
 */
function fromWIF(decoded, network) {
    return fromPrivateKey(decoded.privateKey, {
        compressed: decoded.compressed,
        network: network
    });
}