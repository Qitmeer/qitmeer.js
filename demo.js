const nox = require('./src')

let a = nox.address.ecPubKeyToAddress('039bd3fc0b97a727d26d58fe721518c674397c65aea1ec9b3b1506686d7d81aa84', nox.networks.privnet.pubKeyHashAddrId);

console.log(a);