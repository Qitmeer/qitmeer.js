const bitcoin = require('bitcoinjs-lib');

const params = {};

const mainTest = 'https://test-insight.bitpay.com/';
params.mainnet = {
    network: bitcoin.networks.bitcoin,
    path: "m/44'/0'/0'/0/0",
    getUtxoArr: mainTest + 'api/txs?address={address}&pageNum=0',
    getBalance: mainTest + 'api/addr/{address}/?noTxList=2',
    postSendTx: mainTest + 'api/tx/send'
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