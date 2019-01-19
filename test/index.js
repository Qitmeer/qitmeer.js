const wallet = require('./../wallet/index');
// const a = require('./../wallet/btc/index');
// const hlc = require('../wallet/wallet-hlc')
// const btc = require('../wallet/wallet-btc')
// const bip39 = require('bip39')


// const w = new wallet('1', '1');
// // const w = wallet.walletType();
// console.log(w);

const e = wallet.getETHTotal('gzh', '0x9e8ce592c1597f6e3b6f34c66de33d9dcf60ca9151011f977b8d32b0670c96d0', function (total) {
    console.log(total);
});
// console.log(w['hlc-Privnet']);

// const s = wallet.txSign('eth-Ropsten', {
//     privateKey: '0x9e8ce592c1597f6e3b6f34c66de33d9dcf60ca9151011f977b8d32b0670c96d0',
//     to: '0xCF4Fe31C6E0139c15ED51EfB3Dbf658e1D401b1D',
//     value: '0.2',
//     fees: '1.4',
//     success: function (data) {
//         console.log(data.hash);
//     },
//     error: function (e) {
//         console.log(e);
//         console.log(e.code);
//         console.log(e.message);
//     }
// });

// const a = wallet.createEncrypt(w.words, w.password, w.tips);
// console.log(a);

// let utxo = [{
//     "txid": "6968a527754a51314c4061c4b63f682a15ca8d7f1979428dba3993b793156018",
//     "vout": 1,
//     "amount": "89769080"
// }];
//
// const s = wallet.txSign('btc-Testnet', {
//     utxo: utxo,
//     privateKey: 'cU8y9sxLUji6aicZrUD24BnaZc1EtWqngQe7cVhuZtvhvnQdcRQF',
//     to: 'mtKHfqibpbLT7cqG3uDJ8bZm19thLbjXqu',
//     value: '0.01',
//     fees: '0.0001'
// });
// console.log(s);

// let a = wallet.txSignBTC(utxo, 'cU8y9sxLUji6aicZrUD24BnaZc1EtWqngQe7cVhuZtvhvnQdcRQF', 'mtKHfqibpbLT7cqG3uDJ8bZm19thLbjXqu', '0.01', '0.0001');
// console.log(a);