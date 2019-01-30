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

const hostPriv = 'http://test.wallet.hlchub.org/';
params.privnet = {
    network: networks.privnet,
    path: "m/44'/1'/0'/0/0",
    getUtxoArr: hostPriv + 'api/v1/wallet/utxos?address={address}',
    postSendTx: hostPriv + 'api/v1/tx/sendrawtx'
};

module.exports = params;