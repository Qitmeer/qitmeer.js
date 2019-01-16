const ethers = require('ethers');

/**
 * homestead
 * rinkeby
 * ropsten
 * kovan
 * @type {BaseProvider}
 */
// const provider = ethers.getDefaultProvider();

class ETH {
    static getInstance() {
        if (!ETH.instance) {
            ETH.instance = new ETH();
        }
        return ETH.instance;
    };

    constructor({words, encryptPwd, path, network}) {
        const main = ETH.testnet();
        this.path = path || main.path;
        this.network = network || main.network;
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
        const network = ethers.getDefaultProvider('ropsten');
        const path = "m/44'/60'/0'/0/0";
        return {
            network: network,
            path: path
        }
    }

    static txSign({privateKey, to, value, fees, success, error}, network) {
        const wallet = new ethers.Wallet(privateKey, network);
        fees = parseFloat(fees) * 1000000000;
        const transaction = {
            nonce: 1,
            gasLimit: 210000,
            gasPrice: ethers.utils.bigNumberify(fees),
            to: to,
            value: ethers.utils.parseEther(value),
            data: '0x'
        };

        // const sendPromise = wallet.sign(transaction);
        // sendPromise.then(function (transactionHash) {
        //     console.log(transactionHash);
        // });

        wallet.sendTransaction(transaction).then((hash) => {
            // console.log(hash);
            if (success) success(hash);
        }).catch((e) => {
            console.log(e);
            if (error) error(e);
        });
    }

    static getAmount(privateKey, success, network) {
        const wallet = new ethers.Wallet(privateKey, network);
        const balance = wallet.getBalance();
        balance.then(function (b) {
            const total = b / 1000000000000000000;
            if (success) success(total);
        });
    }
}

module.exports = ETH;