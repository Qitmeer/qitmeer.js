const wallet = require('../wallet/wallet')
const hlc = require('../wallet/wallet-hlc')
const btc = require('../wallet/wallet-btc')
const a = wallet.create('1', '1', '1')

console.log(JSON.stringify(a))

console.log(a.hlc.privateKey)
console.log(a.hlc.address)

const b = hlc.importPrivatyKey(a.hlc.privateKey)
console.log(hlc.toWIF(b))
console.log(hlc.toAddress(b.publicKey))

console.log(a.btc.privateKey)
console.log(a.btc.address)

const c = btc.importPrivatyKey(a.btc.privateKey)
console.log(btc.toWIF(c))
console.log(btc.toAddress(c.publicKey))
