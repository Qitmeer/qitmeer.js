/**
 * BTC ec.js
 * 
 */

const public_EC = require('./../public/ec')
const wif = require('wif')
//私有网络
const _networks = require('./networks').bitcoin

module.exports = {
    fromEntropy,
    fromPrivateKey,
    fromPublicKey,
    fromWIF,
    toWIF
}

/**
 * wif格式私钥
 * @param {*} keyPair 
 */
function toWIF(keyPair) {
    return wif.encode(_networks.wif, keyPair.privateKey, keyPair.compressed)
}

/**
 * 生成随机数
 * @param {json} options {network|rng}
 */
function fromEntropy(options) {
    options = options.network || _networks
    return public_EC.fromEntropy(options)
}


//生成私钥
function fromPrivateKey(buffer, options) {
    options = options.network || _networks
    return public_EC.fromPrivateKey(buffer, options)
}

//生成公钥
function fromPublicKey(buffer, options) {
    options = options.network || _networks
    return public_EC.fromPublicKey(buffer, options)
}

/**
 * 根据WIF格式私钥转换
 * @param {string} string wif格式私钥
 */
function fromWIF(string, network) {
    network = network || _networks
    const decoded = wif.decode(string)
    return public_EC.fromWIF(decoded, network)
}