const bitcoin = require('bitcoinjs-lib');

const params = {};

params.mainnet = {
    network: bitcoin.networks.bitcoin,
    path: "m/44'/0'/0'/0/0"
};

params.testnet = {
    network: bitcoin.networks.testnet,
    path: "m/44'/1'/0'/0/0"
};

module.exports = params;