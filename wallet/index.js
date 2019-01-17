const randomBytes = require('randomBytes');
const cyo = require('./crypto');
const btc = require('./btc/index');
const hlc = require('./hlc/index');
const eth = require('./eth/index');
const bip39 = require('bip39');
new cyo();

class Wallet {
    // static getInstance() {
    //     if (!Wallet.instance) {
    //         Wallet.instance = new Wallet();
    //     }
    //     return Wallet.instance;
    // };

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

        const params = forConfig(words, encryptPwd);
        // const params = forConfig();

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
        return Wallet.init({words, password, tips, encryptPwd: password.toMD5()});
    }


    static txSign(name) {
    
    }

    /**
     * 钱包支持类型，现有币种
     * @returns {string[]}
     */
    static walletType() {
        return forConfig()
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
    const params = {btc: {}, eth: {}, hlc: {}};

    params.btc.func = btc;
    params.btc.list = {
        'btc': {path: '', network: ''},
        'btc-Testnet': {path: btcT.path, network: btcT.network}
    };

    params.eth.func = eth;
    params.eth.list = {
        'eth': {path: '', network: ''},
        'eth-Ropsten': {path: ethT.path, network: ethT.network}
    };

    params.hlc.func = hlc;
    params.hlc.list = {
        'hlc': {},
        'hlc-Privnet': {path: hlcP.path, network: hlcP.network}
    };

    if (isWalletType) return forConfig();
    return params;
}

/**
 * 循环配置文件
 * @param words 助记词
 * @param encryptPwd 加密后的密码
 */
function forConfig(words, encryptPwd) {
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
                        result[item] = new func({
                            words,
                            encryptPwd,
                            path: list[item].path,
                            network: list[item].network
                        });
                    }

                }
            }
        }
    }
    return result;
}

module.exports = Wallet;
