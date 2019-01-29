const bitcoin = require('bitcoinjs-lib');

const params = {};

const mainTest = 'https://chain.api.btc.com/';
params.mainnet = {
    network: bitcoin.networks.bitcoin,
    path: "m/44'/0'/0'/0/0",
    getUtxoArr: mainTest + 'v3/address/{address}/unspent',
    getBalance: mainTest + 'v3/address/{address}',
    postSendTx: mainTest + 'v3/tools/tx-publish'
};

const hostTest = 'https://test-insight.bitpay.com/';
params.testnet = {
    network: bitcoin.networks.testnet,
    path: "m/44'/1'/0'/0/0",
    getUtxoArr: hostTest + 'api/txs?address={address}&pageNum=0',
    getBalance: hostTest + 'api/addr/{address}/?noTxList=2',
    postSendTx: hostTest + 'api/tx/send'
};

module.exports = params;