const ethers = require('ethers');
const config = require('./contract');


class ETH {
    static getInstance() {
        if (!ETH.instance) {
            ETH.instance = new ETH();
        }
        return ETH.instance;
    };

    constructor({words, options, encryptPwd}) {
        const main = ETH.testnet();
        this.path = options.path || main.path;
        this.network = options.network || main.network;//网络
        this.contract = options.contract;//合约
        this.encryptPwd = encryptPwd;
        return this.init(words);
    }

    init(words) {
        const w = ethers.Wallet.fromMnemonic(words, this.path);
        const wallet = new ethers.Wallet(w.privateKey, this.network);
        const address = wallet.address;
        let privateKey = wallet.privateKey;
        if (this.encryptPwd) privateKey = privateKey.encrypt(this.encryptPwd);
        return {
            address: address,
            privateKey: privateKey
        }
    }

    //主网
    static mainnet() {
        const network = ethers.getDefaultProvider();
        const path = "m/44'/60'/0'/0/0";
        return {
            network: network,
            path: path
        }
    }

    //测试网
    static testnet() {
        /**
         * homestead
         * rinkeby
         * ropsten
         * kovan
         * @type {BaseProvider}
         */
        const network = ethers.getDefaultProvider('ropsten');
        const path = "m/44'/60'/0'/0/0";
        return {
            network: network,
            path: path
        }
    }

    static txSign({privateKey, to, value, fees, success, error}, network) {
        fees = parseFloat(fees) * 1000000000;
        const wallet = new ethers.Wallet(privateKey, network);
        network.getTransactionCount(wallet.address).then(function (count) {

            tx(wallet, count, to, value, fees, success, error);

            console.log(count);
        }).catch(function (e) {
            console.log(e);
        });

        // const sendPromise = wallet.sign(transaction);
        // sendPromise.then(function (transactionHash) {
        //     console.log(transactionHash);
        // });


    }

    static getAmount({name, privateKey, success, options}) {
        const token = config[name.toLowerCase()];
        const wallet = new ethers.Wallet(privateKey, options.network);
        if (token) {//有合约 是代币
            const contract = new ethers.Contract(token.id, token.abi, options.network);
            contract.balanceOf(wallet.address).then(function (balance) {
                const total = balance / token.integer;
                if (success) success(total)
            })
        } else {//eth 查询
            const balance = wallet.getBalance();
            balance.then(function (b) {
                const total = ethers.utils.formatEther(b);
                // const total = b / 1000000000000000000;
                // console.log(total);
                if (success) success(total);
            });
        }
    }
}

/**
 * 交易
 * @param wallet 钱包对象
 * @param count 交易个数
 * @param to    接收地址
 * @param value 金额
 * @param fees  手续费（Gwei）
 * @param success   交易成功
 * @param error 交易失败
 */
function tx(wallet, count, to, value, fees, success, error) {
    const transaction = {
        nonce: count,
        gasLimit: 210000,
        gasPrice: ethers.utils.bigNumberify(fees),
        to: to,
        value: ethers.utils.parseEther(value),
        data: '0x'
    };
    wallet.sendTransaction(transaction).then((hash) => {
        // console.log(hash);
        console.log(hash.data);
        console.log(hash.hash);
        if (success) success(hash);
    }).catch((e) => {
        if (e.code === -32000 && e.message.indexOf('transaction') >= 0) {
            tx(wallet, count + 1, to, value, fees, success, error);
        } else {
            if (error) error(e);
        }
        console.log(e.code);
    });
}

module.exports = ETH;