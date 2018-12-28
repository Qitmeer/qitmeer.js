const wallet = require('../wallet/wallet')
const hlc = require('../wallet/wallet-hlc')
const btc = require('../wallet/wallet-btc')
const bip39 = require('bip39')

let utxo = [{
    "txid": "6968a527754a51314c4061c4b63f682a15ca8d7f1979428dba3993b793156018",
    "vout": 1,
    "amount": "89769080"
}];

let a = wallet.txSignBTC(utxo, 'cU8y9sxLUji6aicZrUD24BnaZc1EtWqngQe7cVhuZtvhvnQdcRQF', 'mtKHfqibpbLT7cqG3uDJ8bZm19thLbjXqu', '0.01', '0.0001');
console.log(a);