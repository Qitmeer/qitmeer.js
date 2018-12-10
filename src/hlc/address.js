const public_address = require('./../public/address')
const nox58check = require('./nox58check').default
const network = require('./networks')
const hash = require('./../public/hash')



module.exports = {
    fromBase58Check,
    toBase58Check,
    ecPubKeyToAddress
}


function fromBase58Check(address) {
    const payload = nox58check.decode(address)

    if (payload.length < 22) throw new TypeError(address + ' is too short')
    if (payload.length > 22) throw new TypeError(address + ' is too long')

    const version = payload.readUInt16BE(0)
    const hash = payload.slice(2)

    return public_address.fromBase58Check(version, hash)
}

/**
 *  hash160公钥 转换地址
 * @param hash  hash160公钥
 * @param version 版本
 * @returns {*|string}
 */
function toBase58Check(hash, version) {
    const payload = Buffer.allocUnsafe(22)
    payload.writeUInt16BE(version, 0)
    hash.copy(payload, 2)

    return nox58check.encode(payload)
}

/**
 * 生成地址
 * @param {Buffer} publickey Buffer类型公钥
 * @param {*} version 
 */
function ecPubKeyToAddress(publickey, version) {
    let v = Buffer.alloc(2)
    v.writeUInt16BE(version, 0)

    const ripeMd160 = hash.rmd160(hash.blake2b256(publickey))
    const concatBuffer = Buffer.concat([v, ripeMd160])

    return nox58check.encode(concatBuffer)
}