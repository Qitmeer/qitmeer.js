const ethers = require('ethers');
const ajax = require('./../_tools/ajax');


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


    static async txSign({privateKey, to, value, fees, success, error}, options) {
        const config = options.config;
        const wallet = new ethers.Wallet(privateKey, config.network);
        if (options.contract) {
            let abi = await getABI(options.contract.id);
            if (abi.status === '0') abi.result = options.contract.abi;
            const contract = new ethers.Contract(options.contract.id, abi.result, wallet);
            value = parseFloat(value) * options.contract.integer;
            tx(contract, {token: true, to, value, fees, success, error})
        } else {
            config.network.getTransactionCount(wallet.address).then(function (count) {
                // fees = parseFloat(fees) * 1000000000;
                tx(wallet, {count, to, value, fees, success, error});
            });
        }

    }

    static async getBalance(address, success, options) {
        const config = options.config,
            token = options.contract;

        if (token) {//有合约 是代币
            let abi = await getABI(token.id);
            if (abi.status === '0') abi.result = token.abi;
            const contract = new ethers.Contract(token.id, abi.result, config.network);
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

    static async getABI(address, success) {
        const data = await getABI(address);
        if (success) success(data);
    }

    static async getFees(privateKey, to, value, success, options) {
        const config = options.config,
            token = options.contract;

        let result = {
            gasPrice: ethers.utils.parseUnits('20', 'gwei'),
            gasLimit: 21000
        };
        const wallet = new ethers.Wallet(privateKey, config.network);

        if (token) {
            let abi = await getABI(options.contract.id);
            if (abi.status === '0') abi.result = options.contract.abi;
            const contract = new ethers.Contract(options.contract.id, abi.result, wallet);
            value = parseFloat(value) * options.contract.integer;

            contract.estimate.transfer(to, value).then(function (gas) {
                result.gasLimit = gas;
                result.fees = result.gasPrice * result.gasLimit / 1000000000000000000;
                if (success) success(result)
            });
            return;
        }
        result.fees = result.gasPrice * result.gasLimit / 1000000000000000000;
        if (success) success(result)
    }

}

/**
 * 交易
 * @param wallet 钱包对象
 * @param token 是否是代币
 * @param count 交易个数
 * @param to    接收地址
 * @param value 金额
 * @param fees
 * @param success   交易成功
 * @param error 交易失败
 */
function tx(wallet, {token, count, to, value, fees, success, error}) {
    if (token) {
        if (typeof value !== "number") value = parseFloat(value);
        const param = {
            gasLimit: fees.gasLimit,
            gasPrice: fees.gasPrice
        };
        wallet.transfer(to, value, param).then(function (tx) {
            if (success) success(tx);
        }).catch(function (e) {
            if (error) error(e);
        });
    } else {
        const transaction = {
            nonce: count,
            gasLimit: fees.gasLimit,
            gasPrice: fees.gasPrice,
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


async function getABI(address) {
    const url = 'https://api.etherscan.io/api?module=contract&action=getabi&address={address}&apikey=E8EJGX2ES48CPMUT2TT7NQZKNTHEUC5G4F';
    return await ajax.Get(url, {address: address});
}

module.exports = ETH;