const ethers = require('ethers');

const params = {};
params.mainnet = {
    network: ethers.getDefaultProvider(),
    path: "m/44'/60'/0'/0/0"
};

params.testnet = {
    network: ethers.getDefaultProvider('ropsten'),
    path: "m/44'/60'/0'/0/0"
};

module.exports = params;