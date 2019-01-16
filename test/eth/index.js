const ethcoin = require('./../../wallet/eth/index');

// const eth = ethcoin.getInstance();

// const words = 'skull power tissue west travel visa raw regret turn cash cloth manage finish spare magic thought crack crush trumpet pill comfort short cable screen';
// const words = 'best near close scorpion fatigue olympic air enough before dinosaur nice wet';
const words = 'future screen empower fee apology manual anxiety potato number song enable circle original curve old answer test spider vital between method expire dune energy';

const a = new ethcoin(words);
console.log(JSON.stringify(a));

const to = '0xCF4Fe31C6E0139c15ED51EfB3Dbf658e1D401b1D';
// ethcoin.txSign(a.privateKey, to, '0.1', '1.4');
