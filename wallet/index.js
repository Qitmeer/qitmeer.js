const randomBytes = require('randomBytes');
const cyo = require('./crypto');
const btc = require('./btc/index');
const hlc = require('./hlc/index');
const eth = require('./eth/index');
const bip39 = require('bip39');
new cyo();

class Wallet {

    constructor(password, tips, byte) {
        if (typeof byte !== "number") byte = 32;
        this.byte = byte || 32;
        return Wallet.init({password, tips, byte: this.byte});
    }

    /**
     * 初始化钱包
     * @param words
     * @param password
     * @param tips
     * @param byte
     * @param encryptPwd
     */
    static init({words, password, tips, byte, encryptPwd}) {
        if (!words) {
            const x = randomBytes(byte);
            words = bip39.entropyToMnemonic(x);
        }

        let params = {};
        forConfig(words, {
            encryptPwd: encryptPwd,
            success: function (func, item, options) {
                params[item] = new func(words, options, {encryptPwd: encryptPwd});
            }
        });

        params['tips'] = tips;
        if (!encryptPwd) params['password'] = password;
        if (encryptPwd) words = words.encrypt(encryptPwd);
        params['words'] = words;
        return params;
    }

    /**
     * 生成加密钱包
     * @param words
     * @param password
     * @param tips
     */
    static createEncrypt(words, password, tips) {
        password = password.toMD5();
        return Wallet.init({words, password, tips, encryptPwd: password});
    }

    /**
     * 生成单个钱包
     * @param name  钱包币种名称
     * @param words 助记词
     * @param password  密码（选填，有密码返回私钥加密）
     * @returns {Promise<any>}
     */
    static createSingle(name, words, password) {
        const w = getConfig(name);
        const item = w.item;
        const param = {
            words,
            path: item.path,
            network: item.network
        };
        if (password) param['encryptPwd'] = password.toString();
        return new w.func(param);
    }

    /**
     * 交易
     * @param name  币种名称
     * @param options {utxo|privateKey|to|value|fees|success|error}
     * @returns {*|void}
     */
    static txSign(name, options) {
        const w = getConfig(name);
        return w.func.txSign(options, w.item.network);
    }

    /**
     * 钱包支持类型，现有币种
     * @returns {string[]}
     */
    static walletType() {
        return forConfig()
    }

    /**
     * 解密
     * @param key
     * @param password
     * @returns {*}
     */
    static decryptKey(key, password) {
        return key.decrypt(password.toMD5());
    }


    static getETHTotal(name, privateKey, success) {
        const options = getConfig(name);
        eth.getAmount({name, privateKey, success, options: options.item});
    }
}

/**
 * 配置文件
 * @returns {{btc: {func: BTC}, eth: {func: ETH}, hlc: {func: HLC}}}
 */
function config(isWalletType) {
    isWalletType = isWalletType || false;
    const btcT = btc.testnet();
    const ethT = eth.testnet();
    const hlcP = hlc.privnet();
    const params = {BTC: {}, ETH: {}, HLC: {}};

    params.BTC.func = btc;
    params.BTC.list = {
        'BTC': {path: '', network: ''},
        'BTC-Testnet': {path: btcT.path, network: btcT.network}
    };

    params.ETH.func = eth;
    params.ETH.list = {
        'ETH': {path: '', network: ''},
        'ETH-Ropsten': {path: ethT.path, network: ethT.network},
        'HLC-Token': {path: '', network: ''},
        'HLC-Ropsten': {path: ethT.path, network: ethT.network},
        'GZH': {path: ethT.path, network: ethT.network}
    };

    params.HLC.func = hlc;
    params.HLC.list = {
        'HLC-Privnet': {path: hlcP.path, network: hlcP.network}
    };

    if (isWalletType) return forConfig();
    return params;
}

/**
 * 循环配置文件
 * @param words
 * @param success
 * @param encryptPwd
 */
function forConfig(words, {success, encryptPwd}) {
    const conJson = config(),
        isType = !words;
    let result = {};
    for (const name in conJson) {
        if (conJson.hasOwnProperty(name)) {
            //func
            const func = conJson[name].func,
                //list循环
                list = conJson[name].list;

            //判断是否显示钱包类型
            if (isType) result[name] = [];
            for (const item in list) {
                if (list.hasOwnProperty(item)) {
                    if (isType) {
                        //钱包类型
                        result[name].push(item);
                    } else {
                        //钱包json {address|privateKey}
                        if (success) success(func, item, list[item]);
                    }

                }
            }
        }
    }
    return result;
}

/**
 * 根据名称获取币种配置
 * @param name
 * @returns
 */
function getConfig(name) {
    const conJson = config();
    let result = {};
    for (const conf in conJson) {
        if (conJson.hasOwnProperty(conf)) {
            //func
            const func = conJson[conf].func,
                //list循环
                list = conJson[conf].list;

            for (const item in list) {
                if (list.hasOwnProperty(item)) {
                    if (item.toLowerCase() === name.toLowerCase()) {
                        return {
                            func: func,
                            item: list[item]
                        }
                    }

                }
            }
        }
    }
    return result;
}

module.exports = Wallet;
