const hlccoin = require('./../../wallet/hlc/index');
const hlc1 = require('./../../wallet--弃用/wallet-hlc');

const words = 'seminar worry dune habit online shine mountain idle video range drift object similar north supreme oxygen evidence peace lift decade affair trip mother celery';
// const words = 'ship insane long lecture pretty giggle truth kitchen delay social pulse tone motor pond slam load sunset drift hire walnut capital lava secret vibrant';
const a = new hlccoin(words);
console.log(JSON.stringify(a));

return;
const utxo = [
    {
        "txid": "38321c24bf469d1eb20798b994399d015f680238d26a868aede0af2b896fea69",
        "amount": 9857200000,
        "vout": 1,
        "address": "RmJWrmDQywFjEHTnAdWkvJq3CXZqvZRfMCo",
        "confirmations": 2
    }
];

const tx = hlccoin.txSign(utxo, a.privateKey, 'RmC8RkJs5yVASpWrfSGULuhvTfBEZMm5VpM', '1', '0.214');
console.log(tx);
const tx1 = hlc1.txSign(utxo, a.privateKey, 'RmC8RkJs5yVASpWrfSGULuhvTfBEZMm5VpM', '1', '0.214');
console.log(tx1);

