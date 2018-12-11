const hlc = require('./../src/hlc')
const bip39 = require('bip39');

//
const _network = hlc.networks.privnet

module.exports = {
    createKeyPair,
    toAddress,
    importPrivatyKey,
    importWords,
    words,
    toWIF
}

/**
 * 生成随机数
 */
function createKeyPair() {
    return hlc.EC.fromEntropy({
        network: _network
    });
}

/**
 * 导出wif格式私钥
 * @param {*} keyPair 
 */
function toWIF(keyPair){
    return hlc.EC.toWIF(keyPair)
}

/**
 * 导出地址
 * @param {buffer} pubkey 
 */
function toAddress(pubkey) {
    return hlc.address.ecPubKeyToAddress(pubkey, _network.pubKeyHashAddrId)
}

function importPrivatyKey(key) {
    return keyPair = hlc.EC.fromWIF(key);
}

function importWords(key) {
    const privHex = bip39.mnemonicToEntropy(key);
    return keyPair = hlc.EC.fromPrivateKey(Buffer.from(privHex, 'hex'));
}

function words(privkey) {
    const keyPair = hlc.EC.fromWIF(privatekey, _network);
    return bip39.entropyToMnemonic(keyPair.privateKey.toString('hex'));
}