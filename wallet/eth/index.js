const ethers = require('ethers');

/**
 * homestead
 * rinkeby
 * ropsten
 * kovan
 * @type {BaseProvider}
 */
// const provider = ethers.getDefaultProvider();
const provider = ethers.getDefaultProvider('ropsten');
const path = "m/44'/60'/0'/0/0";


class ETH {
    static getInstance() {
        if (!ETH.instance) {
            ETH.instance = new ETH();
        }
        return ETH.instance;
    };

    constructor() {
        this.path = "m/44'/60'/0'/0/0";
    }

    static keyPair(words) {
        const w = ethers.Wallet.fromMnemonic(words, path);
        const wallet = new ethers.Wallet(w.privateKey, provider);
        const address = wallet.address;
        const privateKey = wallet.privateKey;

        // const balance = wallet.getBalance();
        // balance.then(function (b) {
        //     const total = b / 1000000000000000000;
        //     console.log(total);
        //     console.log(b);
        // });

        return {
            address: address,
            privateKey: privateKey
        }
    }

    static txSign({privateKey, to, value, fees, success, error}) {
        const provider = ethers.getDefaultProvider('ropsten');
        const wallet = new ethers.Wallet(privateKey, provider);
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

    static getAmount(privateKey, success) {
        const wallet = new ethers.Wallet(privateKey, provider);
        const balance = wallet.getBalance();
        balance.then(function (b) {
            const total = b / 1000000000000000000;
            if (success) success(total);
        });
    }
}

module.exports = ETH;