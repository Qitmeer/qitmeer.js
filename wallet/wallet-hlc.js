const hlc = require('./../src/hlc')
const bip39 = require('bip39')

//
const _network = hlc.networks.privnet

module.exports = {
    createKeyPair,
    toAddress,
    toWIF,
    txSign,
    importPrivatyKey,
    importWords
}

/**
 * 生成随机数
 */
function createKeyPair(x) {
    const options = {}
    if (x) options.x = x
    options.network = options.network || _network

    return hlc.ec.fromEntropy(options);
}

/**
 * 导出wif格式私钥
 * @param {*} keyPair 
 */
function toWIF(keyPair) {
    return hlc.ec.toWIF(keyPair)
}

/**
 * 导出地址
 * @param {buffer} pubkey 
 */
function toAddress(pubkey) {
    return hlc.address.ecPubKeyToAddress(pubkey, _network.pubKeyHashAddrId)
}

function importPrivatyKey(key) {
    return keyPair = hlc.ec.fromWIF(key, _network);
}

function importWords(key) {
    const privHex = bip39.mnemonicToEntropy(key);
    return keyPair = hlc.ec.fromPrivateKey(Buffer.from(privHex, 'hex'), {
        network: _network
    });
}

function words(privkey) {
    const keyPair = hlc.ec.fromWIF(privkey, _network);
    return bip39.entropyToMnemonic(keyPair.privateKey.toString('hex'));
}

function txSign(utxo, privkey, to, value, fees) {
    const keyPair = hlc.ec.fromWIF(privkey)
    const from = toAddress(keyPair.publicKey)
    const txb = hlc.txsign.newSigner()
    // txb.setVersion(_network.pubKeyHashAddrId);
    txb.setVersion(1);

    const fullValue = parseFloat(value) * 100000000
    const fullFees = parseFloat(fees) * 100000000

    let [total, utxoArr] = [0, []]
    for (let i = 0, len = utxo.length; total < (fullValue + fullFees) && i < len; i++) {
        total += utxo[i].amount
        utxoArr.push(utxo[i])
        txb.addInput(utxo[i].txid, utxo[i].vout)
    }

    txb.addOutput(to, fullValue)
    const balance = total - fullValue - fullFees
    if (balance > 0) {
        txb.addOutput(from, balance)
    } else {
        return -1
    }

    for (let i = 0, len = utxoArr.length; i < len; i++) {
        txb.sign(i, keyPair)
    }

    return txb.build().toBuffer().toString('hex')
}