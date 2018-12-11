/**
 * HLC ec.js
 * 
 */

const public_EC = require('./../public/ec')
const wif = require('./wif')
//私有网络
const networks = require('./networks').privnet

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
    return keyPair.toWIF(wif);
}

/**
 * 生成随机数
 * @param {json} options {network|rng}
 */
function fromEntropy(options) {
    options.network = options.network || networks
    return public_EC.fromEntropy(options)
}

//生成私钥
function fromPrivateKey(buffer, options) {
    options = options.network || networks
    return public_EC.fromPrivateKey(buffer, options)
}

//生成公钥
function fromPublicKey(buffer, options) {
    options = options.network || networks
    return public_EC.fromPublicKey(buffer, options)
}

/**
 * 根据WIF格式私钥转换
 * @param {string} string wif格式私钥
 */
function fromWIF(string) {
    const decoded = wif.decode(string);
    return public_EC.fromWIF(decoded, networks)
}