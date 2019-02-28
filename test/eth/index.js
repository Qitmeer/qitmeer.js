const ethcoin = require('./../../wallet/eth/index');
const config = require('./../../wallet/eth/config');
const ethers = require('ethers');
// const eth = ethcoin.getInstance();

const words = 'skull power tissue west travel visa raw regret turn cash cloth manage finish spare magic thought crack crush trumpet pill comfort short cable screen';
// const words = 'best near close scorpion fatigue olympic air enough before dinosaur nice wet';
// const words = 'future screen empower fee apology manual anxiety potato number song enable circle original curve old answer test spider vital between method expire dune energy';
const options = config.testnet;
const a = new ethcoin({words, options});
console.log(JSON.stringify(a));

const to = '0x5d2e279654C34536c33AcB36B74e3C20b8DeD08D';

const tokens = require('./../../wallet/eth/contracts');


const amount = 100 * 100;
const fees = '1';

var targetAddress = ethers.utils.getAddress(to);
const wallet = new ethers.Wallet(a.privateKey, options.network);
const gzh = tokens['hlc-token'];
const contract = new ethers.Contract(gzh.id, gzh.abi, wallet);

// ethcoin.txSign({
//     tokenName: 'gzh',
//     privateKey: a.privateKey,
//     to: to,
//     value: 11,
//     fees: 2,
//     success: function (tx) {
//         console.log(tx);
//     },
//     error: function (e) {
//         console.log(e);
//     }
// }, options.network);


// contract.estimate.transfer(to, amount).then(function (gas) {
//     contract.transfer(to, amount, {
//         gasLimit: gas,
//         gasPrice: ethers.utils.parseUnits(fees, 'gwei')
//     }).then(function (tx) {
//         console.log(tx);
//     }).catch(function (e) {
//         console.log(e);
//         console.log(e.code);
//         console.log(e.message);
//     });
// });


