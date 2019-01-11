const wallet = require('../wallet/wallet')
const hlc = require('../wallet/wallet-hlc')
const btc = require('../wallet/wallet-btc')
const bip39 = require('bip39')

let utxo = [{
    amount: "88439080",
    txid: "042387207d8e072da264b725e80e8035d5d87febf82d3e61560b320d5f1af7b7",
    vout: 1
}];

// let a = wallet.txSignBTC(utxo, 'cU8y9sxLUji6aicZrUD24BnaZc1EtWqngQe7cVhuZtvhvnQdcRQF', 'muMk2yN9E7fA5ZvwNuXncaM3UcifrNHKuh', '0.01', '0.0001');
// console.log(a);

wallet.create('1','1','1')