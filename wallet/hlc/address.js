//hlc
const nox58check = require('./nox58check').default;
const Network = require('./networks');
const cypto = require('./../hash');
const Script = require('./script');


module.exports = {
    fromBase58Check,
    toBase58Check,
    ecPubKeyToAddress,
    toOutputScript
};


function fromBase58Check(address) {
    const payload = nox58check.decode(address);

    if (payload.length < 22) throw new TypeError(address + ' is too short');
    if (payload.length > 22) throw new TypeError(address + ' is too long');

    const version = payload.readUInt16BE(0);
    const hash = payload.slice(2);

    return {
        version: version,
        hash: hash
    }
}

/**
 *  hash160公钥 转换地址
 * @param hash  hash160公钥
 * @param version 版本
 * @returns {*|string}
 */
function toBase58Check(hash, version) {
    const payload = Buffer.allocUnsafe(22);
    payload.writeUInt16BE(version, 0);
    hash.copy(payload, 2);

    return nox58check.encode(payload)
}

/**
 * 生成地址
 * @param {Buffer} publickey Buffer类型公钥
 * @param {*} version
 */
function ecPubKeyToAddress(publickey, version) {
    let v = Buffer.alloc(2);
    v.writeUInt16BE(version, 0);

    const ripeMd160 = cypto.rmd160(cypto.blake2b256B(publickey));
    const concatBuffer = Buffer.concat([v, ripeMd160]);

    return nox58check.encode(concatBuffer)
}

function toOutputScript(address, network) {
    network = network || Network.privnet;
    const decode = fromBase58Check(address);
    if (decode) {
        if (decode.version === network.pubKeyHashAddrId) return Script.Output.P2PKH(decode.hash);
        throw Error('Unknown version ' + decode.version)
    }
    throw Error('fail to base58check decode ' + address)
}