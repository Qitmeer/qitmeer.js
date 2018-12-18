const hlc = require('./wallet-hlc')
const btc = require('./wallet-btc')
const public_EC = require('./../src/public/ec')
const bip39 = require('bip39')
const crypto = require('crypto')

module.exports = {
    create,
    createEncrypt,
    decipherWords,
    txSignHLC,
    txSignBTC
}


/**
 * 生成钱包 
 * @param {string} account 账户名称
 * @param {string} password 密码
 * @param {string} tips 提示
 */
function create(account, password, tips) {
    const x = public_EC.entropy()
    let result = walletJson({
        x: x
    })
    result['account'] = account
    result['password'] = password
    result['tips'] = tips
    return result
}

/**
 * 生成正式钱包
 * @param {string} key 助记词
 * @param {string} account 账户名称
 * @param {string} password 密码
 * @param {string} tips 提示
 */
function createEncrypt(key, account, password, tips) {
    const x = bip39.mnemonicToEntropy(key)
    let result = walletJson({
        x: x
    })
    result['account'] = account
    result['tips'] = tips
    result['words'] = cipher(key, toMD5(password))
    result.hlc['privateKey'] = cipher(result.hlc.privateKey, toMD5(password))
    result.btc['privateKey'] = cipher(result.btc.privateKey, toMD5(password))
    return result
}

function decipherWords(dwords, password) {
    return decipher(dwords, toMD5(password));
}

function txSignHLC(utxo, privkey, to, value, fees) {
    return hlc.txSign(utxo, privkey, to, value, fees)
}

function txSignBTC(utxo, privkey, to, value, fees) {
    return btc.txSign(utxo, privkey, to, value, fees)
}


/**
 * 返回json集合
 * @param {json} x 
 */
function walletJson(x) {
    const keyPair = {
        hlc: hlc.createKeyPair(x),
        btc: btc.createKeyPair(x)
    }
    return {
        words: bip39.entropyToMnemonic(x.x.toString('hex')),
        hlc: {
            address: hlc.toAddress(keyPair.hlc.publicKey),
            privateKey: hlc.toWIF(keyPair.hlc)
        },
        btc: {
            address: btc.toAddress(keyPair.btc.publicKey),
            privateKey: btc.toWIF(keyPair.btc)
        },
    }
}
/**
 * md5加密
 * @param {*} key 
 */
const toMD5 = (key) => {
    const md5 = crypto.createHash('md5');
    md5.update(key);
    return md5.digest('hex');
}
/**
 * 加密
 * @param {*} key 
 * @param {*} password 
 */
const cipher = (key, password) => {
    const cyo = crypto.createCipher('aes-256-cbc', password);
    let result = cyo.update(key, 'htf8', 'hex');
    result += cyo.final('hex');
    return result;
}
/**
 * 解密
 * @param {*} key 
 * @param {*} password 
 */
const decipher = (key, password) => {
    const cyo = crypto.createDecipher('aes-256-cbc', password);
    let result = cyo.update(key, 'hex', 'utf8');
    try {
        result += cyo.final('utf8');
    } catch (e) {
        return false;
    }
    return result;
}