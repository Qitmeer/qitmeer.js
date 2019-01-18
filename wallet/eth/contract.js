const ethers = require('ethers');
const tokens = require('./tokensConfig');
const network = ethers.getDefaultProvider();
const contract = new ethers.Contract(tokens.hlc.contract, tokens.hlc.abi, network);


contract.balanceOf('0x4b711c2506f9e52410f3d2b08a9a0a3dd6c03225').then(function (b) {
    console.log(b);
    const total = b / 1000000000;
    console.log(total);
});