const networks = require('./networks');

const params = {};

params.mainnet = {
    network: networks.mainnet,
    path: "m/44'/0'/0'/0/0"
};

params.testnet = {
    network: networks.testnet,
    path: "m/44'/1'/0'/0/0"
};

params.privnet = {
    network: networks.privnet,
    path: "m/44'/1'/0'/0/0"
};

module.exports = params;