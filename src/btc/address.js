//btc
const public_address = require('./../public/address')
const bs58check = require('bs58check')
const hash = require('./../public/hash')
const payments = require('./payments')



module.exports = {
    fromBase58Check,
    toBase58Check,
    ecPubKeyToAddress,
    toOutputScript
}


function fromBase58Check(address) {
    const payload = bs58check.decode(address)

    // TODO: 4.0.0, move to "toOutputScript"
    if (payload.length < 21) throw new TypeError(address + ' is too short')
    if (payload.length > 21) throw new TypeError(address + ' is too long')

    const version = payload.readUInt8(0)
    const hash = payload.slice(1)

    return public_address.fromBase58Check(version, hash)
}

function toBase58Check(hash, version) {
    const payload = Buffer.allocUnsafe(21)
    payload.writeUInt8(version, 0)
    hash.copy(payload, 1)

    return bs58check.encode(payload)
}

function ecPubKeyToAddress(publickey, version) {
    let v = Buffer.alloc(1)
    v.writeUInt8(version, 0)

    const hash160 = hash.hash160_btc(publickey)
    const concatBuffer = Buffer.concat([v, hash160])

    return bs58check.encode(concatBuffer)
}


function toOutputScript(address, network) {
    let decode
    try {
        decode = fromBase58Check(address)
    } catch (e) {}

    if (decode) {
        if (decode.version === network.pubKeyHash) return payments.p2pkh({
            hash: decode.hash
        }).output
        if (decode.version === network.scriptHash) return payments.p2sh({
            hash: decode.hash
        }).output
    } else {
        try {
            decode = fromBech32(address)
        } catch (e) {}

        if (decode) {
            if (decode.prefix !== network.bech32) throw new Error(address + ' has an invalid prefix')
            if (decode.version === 0) {
                if (decode.data.length === 20) return payments.p2wpkh({
                    hash: decode.data
                }).output
                if (decode.data.length === 32) return payments.p2wsh({
                    hash: decode.data
                }).output
            }
        }
    }

    throw new Error(address + ' has no matching Script')
}