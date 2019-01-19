const web3 = require('web3');
const eth = require("web3-eth");
const gzh = require('./contract').gzh;

let metacoin = web3.eth.contract(gzh.abi);

// eth.contract(gzh.abi);

