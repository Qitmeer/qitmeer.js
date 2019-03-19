const randomBytes = require('randomBytes');
const cyo = require('./_tools/crypto');
const eth = require('./eth/index');
const bip39 = require('bip39');
const config = require('./config');

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
        config.foreach(function (func, typeName, name, options) {
            let isFirst =  true;
            if (!params[typeName]) {
                params[typeName] = {};
                isFirst = true;
            }
            params[typeName][name] = new func({words, options, encryptPwd});
            if (isFirst) {
                params[typeName][name].display = true;
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
        const params = config.get(name);
        const param = {
            words: words,
            options: params.options
        };
        if (password) param['encryptPwd'] = password.toString();
        return new params.func(param);
    }

    /**
     * 交易
     * @param name  币种名称
     * @param options {utxo|privateKey|to|value|fees|success|error}
     * @returns {*|void}
     */
    static txSign(name, options) {
        const param = config.get(name);
        try {
            return param.func.txSign(options, param.options)
        } catch (e) {
            return false
        }

    }

    static checkAddr(name, address) {
        let result = false;

        switch (name) {
            case 'btc':
                if (address.length !== 34) return result;
                result = true;
                break;
            case 'eth':
                if (address.length !== 42) return result;
                if (address.indexOf('0x') !== 0) return result;
                result = true;
                break;
            case 'hlc':
                if (address.length !== 36) return result;
                if (address.indexOf('hRm') !== 0) return result;
                result = true;
                break;
        }
        return result
    }

    /**
     * 钱包支持类型，现有币种
     * @returns {string[]}
     */
    static walletArray() {
        return config.getArray()
    }

    static walletTree() {
        return config.getTree()
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


    static getBalance(name, address, success) {
        const conf = config.get(name);
        if (conf.options)
            conf.func.getBalance(address, success, conf.options)
    }

    static getABI(address, success) {
        eth.getABI(address, success);
    }

    static getEthFees(name, privateKey, to, value, success) {
        const conf = config.get(name);
        eth.getFees(privateKey, to, value, success, conf.options)
    }

}


module.exports = Wallet;
