const nox = require('./src');
const bip39 = require('bip39');
const crypto = require('crypto');


//HLC网络
const _network = nox.networks.privnet;

let _public = {};

//创建钱包
_public.createWallet = (account, password, tips) => {
    const keyPair = createKeyPair();
    return walletJson(keyPair, account, password, tips);
}

//导入私钥
_public.importPrivateKey = (key, account, password, tips) => {
    const keyPair = nox.ec.fromWIF(key);
    return walletJson(keyPair, account, password, tips);
}

//导入助记词
_public.importWords = (words, account, password, tips) => {
    const privHex = bip39.mnemonicToEntropy(words);
    const keyPair = nox.ec.fromPrivateKey(Buffer.from(privHex, 'hex'));
    return walletJson(keyPair, account, password, tips);
}

/**
 * 返回json集合
 * @param {*} keyPair 
 * @param {*} account 账号
 * @param {*} password 密码
 * @param {*} tips 提示词
 */
const walletJson = (keyPair, account, password, tips) => {
    const publicKey = keyPair.publicKey.toString('hex');
    return {
        account: account,
        password: password,
        address: walletAddress(publicKey),
        privateKey: keyPair.toWIF(),
        publicKey: publicKey,
        tips: tips
    }
}

//生成正式钱包
_public.walletEncryptWallet = (privateKey, account, password, tips) => {
    const keyPair = nox.ec.fromWIF(privateKey);
    const publicKey = keyPair.publicKey.toString('hex');
    return {
        account: account,
        address: walletAddress(publicKey),
        privateKey: cipher(keyPair.toWIF(), toMd5(password)),
        publicKey: publicKey,
        tips: tips
    };
}

//解密私钥
_public.decipherPrivateKey = (dprivateKey, password) => {
    return decipher(dprivateKey, toMd5(password));
}

//获取助记词
_public.words = (wifPrivateKey) => {
    const keyPair = nox.ec.fromWIF(wifPrivateKey);
    return bip39.entropyToMnemonic(keyPair.privateKey.toString('hex'));
}

//解密获取助记词
_public.decipherWords = (dprivateKey, password) => {
    const wifPrivateKey = decipher(dprivateKey, toMd5(password));
    const keyPair = nox.ec.fromWIF(wifPrivateKey);
    return bip39.entropyToMnemonic(keyPair.privateKey.toString('hex'));
}

//获取ec类型私钥
_public.walletECPrivateKey = (dprivateKey, password) => {
    const wifPrivateKey = decipher(dprivateKey, toMd5(password));
    if (typeof wifPrivateKey === 'boolean') return '密码错误';
    const ecPair = nox.ec.fromWIF(wifPrivateKey);
    return Buffer.from(ecPair.privateKey).toString('hex');
}



/**
 * 钱包地址
 * @param {*} publicKey 公钥
 */
const walletAddress = publicKey => {
    return nox.address.toBase58Check(publicKey, _netWork.pubKeyHashAddrId);
}

//生成随机数
const createKeyPair = () => {
    return nox.ec.fromEntropy();
}

//md5加密
const toMd5 = key => {
    const md5 = crypto.createHash('md5');
    md5.update(key);
    return md5.digest('hex');
}

//加密
const cipher = (key, password) => {
    const cry = crypto.createCipher('aes-256-cbc', password);
    let result = cry.update(key, 'utf8', 'hex');
    result += cry.final('hex');
    return result;
}

//解密
const decipher = (key, password) => {
    const cry = crypto.createDecipher('aes-256-cbc', password);
    let result = cry.update(key, 'hex', 'utf8');
    try {
        result += cry.final('utf8');
    } catch (e) {
        return false;
    }
    return result;
}


module.exports = _public;