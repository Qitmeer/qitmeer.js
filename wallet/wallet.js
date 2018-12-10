const hlc = require('./wallet-hlc')
const btc = require('./wallet-btc')


module.exports = {
    createHLC,
    createBTC,
    importPrivatyKeyHLC,
    importPrivatyKeyBTC,
    importWordsHLC,
    importWordsBTC,
    createEncryptHLC,
    createEncryptBTC,
    decipherPivateKey,
    wordsHLC,
    wordsBTC,
    decipherWordsHLC,
    decipherWordsBTC
}

/**
 * 创建hlc钱包
 * @param {*} account 账号
 * @param {*} password 密码
 * @param {*} tips 密码提示词
 */
function createHLC(account, password, tips) {
    const keyPair = hlc.createKeyPair();
    return walletJson(keyPair, 'HLC', account, password, tips);
}
/**
 * 创建btc钱包
 * @param {*} account 账号
 * @param {*} password 密码
 * @param {*} tips 密码提示词
 */
function createBTC(account, password, tips) {
    const keyPair = btc.createKeyPair();
    return walletJson(keyPair, 'BTC', account, password, tips);
}

function importPrivatyKeyHLC(key, account, password, tips) {
    return walletJson(hlc.importPrivatyKey(key), 'HLC', account, password, tips);
}

function importPrivatyKeyBTC(key, account, password, tips) {
    return walletJson(btc.importPrivatyKey(key), 'BTC', account, password, tips);
}

function importWordsHLC(key, account, password, tips) {
    return walletJson(hlc.importWords(key), 'HLC', account, password, tips);
}

function importWordsBTC(key, account, password, tips) {
    return walletJson(btc.importWords(key), 'BTC', account, password, tips);
}

function createEncryptHLC(privkey, account, password, tips) {
    const keyPair = hlc.importPrivatyKey(privkey)
    const publicKey = keyPair.publicKey
    return {
        account: account,
        address: hlc.toAddress(publicKey),
        privateKey: cipher(keyPair.toWIF(), toMD5(password)),
        publicKey: publicKey.toString('hex'),
        tips: tips
    }
}

function createEncryptBTC(privkey, account, password, tips) {
    const keyPair = btc.importPrivatyKey(privkey)
    const publicKey = keyPair.publicKey
    return {
        account: account,
        address: btc.toAddress(publicKey),
        privateKey: cipher(keyPair.toWIF(), toMD5(password)),
        publicKey: publicKey.toString('hex'),
        tips: tips
    }
}

function decipherPivateKey(dprivatekey, password) {
    return decipher(dprivatekey, toMD5(password));
}

function wordsHLC(privkey) {
    return hlc.words(privkey)
}

function wordsBTC(privkey) {
    return btc.words(privkey)
}

function decipherWordsHLC(dprivatekey, password) {
    const privkey = decipherPivateKey(dprivatekey, password)
    return wordsHLC(privkey)
}

function decipherWordsBTC(dprivatekey, password) {
    const privkey = decipherPivateKey(dprivatekey, password)
    return wordsBTC(privkey)
}
/**
 * 返回json集合
 * @param {*} keyPair
 * @param {string} typeName 类型名称 {BTC|HLC}
 * @param {string} account 账号
 * @param {string} password 密码
 * @param {string} tips 提示词
 */
const walletJson = (keyPair, typeName, account, password, tips) => {
    const publicKey = keyPair.publicKey;
    let result = {
        account: account,
        password: password,
        address: '',
        privateKey: keyPair.toWIF(),
        publicKey: publicKey.toString('hex'),
        tips: tips
    }

    if (typeName) typeName = typeName.toUpperCase()
    switch (typeName) {
        case 'BTC':
            result.address = btc.toAddress(publicKey)
            break;
        case 'HLC':
            result.address = hlc.toAddress(publicKey)
            break;
    }

    return result
};
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