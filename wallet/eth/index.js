const ethers = require('ethers');


class ETH {
    static getInstance() {
        if (!ETH.instance) {
            ETH.instance = new ETH();
        }
        return ETH.instance;
    };

    constructor({words, options, encryptPwd}) {
        this.path = options.path;
        this.network = options.network;//网络
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


    static txSign({privateKey, to, value, fees, success, error}, options) {
        const config = options.config;
        const wallet = new ethers.Wallet(privateKey, config.network);
        if (options.contract) {
            const contract = new ethers.Contract(options.contract.id, options.contract.abi, wallet);
            value = parseFloat(value) * options.contract.integer;
            tx(contract, {token: true, to, value, fees, success, error})
        } else {
            config.network.getTransactionCount(wallet.address).then(function (count) {
                fees = parseFloat(fees) * 1000000000;
                tx(wallet, {count, to, value, fees, success, error});
            });
        }

    }

    static getBalance(address, success, options) {
        const config = options.config,
            token = options.contract;

        if (token) {//有合约 是代币
            const contract = new ethers.Contract(token.id, token.abi, config.network);
            contract.balanceOf(address).then(function (balance) {
                const total = balance / token.integer;
                if (success) success(total)
            })
        } else {//eth 查询
            config.network.getBalance(address).then(function (b) {
                const total = ethers.utils.formatEther(b);
                if (success) success(total);
            });
        }
    }
}

/**
 * 交易
 * @param wallet 钱包对象
 * @param token 是否是代币
 * @param count 交易个数
 * @param to    接收地址
 * @param value 金额
 * @param fees  手续费（Gwei）
 * @param success   交易成功
 * @param error 交易失败
 */
function tx(wallet, {token, count, to, value, fees, success, error}) {
    if (token) {
        if (typeof value !== "number") value = parseFloat(value);
        wallet.estimate.transfer(to, value).then(function (gas) {
            wallet.transfer(to, value, {
                gasLimit: gas,
                gasPrice: ethers.utils.parseUnits(fees.toString(), 'gwei')
            }).then(function (tx) {
                console.log(tx);
                if (success) success(tx);
            }).catch(function (e) {
                if (error) error(e);
            });
        });
    } else {
        const transaction = {
            nonce: count,
            gasLimit: 210000,
            gasPrice: ethers.utils.bigNumberify(fees),
            to: to,
            value: ethers.utils.parseEther(value.toString()),
            data: '0x'
        };
        wallet.sendTransaction(transaction).then((hash) => {
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

}

module.exports = ETH;