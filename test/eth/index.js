const ethcoin = require('./../../wallet/eth/index');

const eth = ethcoin.getInstance();

const words = 'skull power tissue west travel visa raw regret turn cash cloth manage finish spare magic thought crack crush trumpet pill comfort short cable screen';

const a = eth.keyPair(words);
console.log(JSON.stringify(a));
