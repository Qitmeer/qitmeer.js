const ethers = require('ethers');
const tokens = require('./contract');
const network = ethers.getDefaultProvider('ropsten');
const contract = new ethers.Contract(tokens.gzh.id, tokens.gzh.abi, network);


contract.balanceOf('0xCF4Fe31C6E0139c15ED51EfB3Dbf658e1D401b1D').then(function (b) {
    console.log(b);
    const total = b / tokens.gzh.integer;
    console.log(total);
});


