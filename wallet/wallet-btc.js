const btc = require('./../src/btc')


//
const _network = btc.networks.bitcoin

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
    return btc.EC.fromEntropy({
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
    return btc.address.ecPubKeyToAddress(pubkey, _network.pubKeyHashAddrId)
}


function importPrivatyKey(key) {
    return keyPair = btc.EC.fromWIF(key);
}

function importWords(key) {
    const privHex = bip39.mnemonicToEntropy(key);
    return keyPair = btc.EC.fromPrivateKey(Buffer.from(privHex, 'hex'));
}

function words(privkey) {
    const keyPair = btc.EC.fromWIF(privatekey, _network);
    return bip39.entropyToMnemonic(keyPair.privateKey.toString('hex'));
}