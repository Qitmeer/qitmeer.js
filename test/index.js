
// const w = require('./../src----hlc')

// const ecpair = w.ec.fromEntropy()
// ecpair.toWIF()

const wallet = require('../wallet/wallet')

const hlcCreate = wallet.createHLC('1', '1', '1')

console.log(JSON.stringify(hlcCreate))




