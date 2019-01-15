const ethers = require('ethers');

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
        const wallet = ethers.Wallet.fromMnemonic(words, this.path);
        const address = wallet.address;
        const privateKey = wallet.privateKey;
        return {
            address: address,
            privateKey: privateKey
        }
    }
}

module.exports = ETH;