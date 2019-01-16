const host = 'https://test-insight.bitpay.com/';

module.exports = {
    getUtxo: host + 'api/txs?address={address}&pageNum=0',
    sendTx: host + 'api/tx/send',
    getAmount: host + 'api/addr/{address}/?noTxList=2'
};