const wallet = require('./../wallet/index');

//生成随机钱包
// const w = new wallet('1', '1');

// const words = 'seminar worry dune habit online shine mountain idle video range drift object similar north supreme oxygen evidence peace lift decade affair trip mother celery';
const words = 'skull power tissue west travel visa raw regret turn cash cloth manage finish spare magic thought crack crush trumpet pill comfort short cable screen';
// const words = 'best near close scorpion fatigue olympic air enough before dinosaur nice wet';
// const words = 'future screen empower fee apology manual anxiety potato number song enable circle original curve old answer test spider vital between method expire dune energy';

//生成随机加密钱包
const w = wallet.createEncrypt(words, '1', '1');
console.log(w);

// wallet.getFees('hlc-token', '0xCF4Fe31C6E0139c15ED51EfB3Dbf658e1D401b1D', '100', function (data) {
//     console.log(data);
// });

//
// const dk = wallet.decryptKey(ce.words, '1');
// // console.log(dk);
//
// const wArr = wallet.walletArray();
// // console.log(wArr);
//
// const wt = wallet.walletTree();
// // console.log(wt);
//
// const cs = wallet.createSingle('hlc-privnet', w.words, '1');
// console.log(cs);

// wallet.getETHTotal('gzh-token-ropsten', '0xd6f6c99d72ff38b0fb0d84a1e020bc598342bf635126f81178ee39f84792e355', function (amount) {
//     console.log(amount);
// });
//
//
// for (const item in w) {
//     if (w.hasOwnProperty(item) && typeof w[item] === 'object') {
//         wallet.getBalance(item, w[item].address, function (amount) {
//             console.log(item);
//             console.log(amount);
//         });
//     }
// }


// wallet.txSign('gzh-token-ropsten', {
//     privateKey: '0xd6f6c99d72ff38b0fb0d84a1e020bc598342bf635126f81178ee39f84792e355',
//     to: '0x5d2e279654C34536c33AcB36B74e3C20b8DeD08D',
//     value: 123,
//     fees: 1.4,
//     success: function (tx) {
//         console.log(tx);
//     }
// });
//
// wallet.txSign('gzh-token-ropsten', {
//     privateKey: '0xd6f6c99d72ff38b0fb0d84a1e020bc598342bf635126f81178ee39f84792e355',
//     to: '0x5d2e279654C34536c33AcB36B74e3C20b8DeD08D',
//     value: '121',
//     fees: '1.4',
//     success: function (tx) {
//         console.log(tx);
//     }
// });

// const words = 'seminar worry dune habit online shine mountain idle video range drift object similar north supreme oxygen evidence peace lift decade affair trip mother celery';
// // const words = 'skull power tissue west travel visa raw regret turn cash cloth manage finish spare magic thought crack crush trumpet pill comfort short cable screen';
// const btcW = wallet.createEncrypt(words, '1', '1');
// console.log(btcW['btc-testnet']);
//
// wallet.txSign('btc-testnet', {
//     privateKey: wallet.decryptKey(btcW['btc-testnet'].privateKey, '1'),
//     to: 'my5iM2LLT3S6nKKujZG4HTZe93MkKv5UY3',
//     value: 0.001,
//     fees: 0.00001,
//     success: function (data) {
//         console.log(data.txid);
//     },
//     error: function (data) {
//         console.log(data);
//     }
// });

// return;

const privateKey = '0xd6f6c99d72ff38b0fb0d84a1e020bc598342bf635126f81178ee39f84792e355';
const to = '0xa37f8ce944d76ab86409e73375dd53bafe324468';
const amount = '0.1';
//
// wallet.getEthFees('eth-ropsten', privateKey, to, amount, function (fees) {
//     console.log(fees);
//     wallet.txSign('eth-ropsten', {
//         privateKey: privateKey,
//         to: to,
//         value: amount,
//         fees: fees,
//         success: function (data) {
//             console.log(data);
//         }
//     })
// });


