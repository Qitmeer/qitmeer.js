const wallet = require('../wallet/wallet')
const hlc = require('../wallet/wallet-hlc')
const btc = require('../wallet/wallet-btc')
const bip39 = require('bip39')


const a = wallet.create('1', '1')
console.log(JSON.stringify(a))
// // console.log(a.btc.address)
// // const aa = wallet.createEncrypt('photo ramp quote drop humble exclude bid force essay short orient modify improve inform state immense bubble behave near garbage oven glimpse clown sphere', a.password, a.tips)

const aa = wallet.createEncrypt(a.words, a.password, a.tips)

console.log(JSON.stringify(aa))
// // console.log(wallet.decipherWords(aa.btc.privateKey, '1'))
// // console.log(aa.btc.address)

// // const aaa = btc.words('cT4wDwKrT3R33XfHK5kMZuSphqZxVVDfD5XYszaficiW4mnm36Pg')
// // console.log(aaa)

// // const b = btc.importWords('photo ramp quote drop humble exclude bid force essay short orient modify improve inform state immense bubble behave near garbage oven glimpse clown sphere')
// const b = btc.importWords(a.words)
// // console.log(b.privateKey.toString('hex'))
// console.log(btc.toWIF(b))
// console.log(btc.toAddress(b.publicKey))
// console.log(bip39.entropyToMnemonic(b.privateKey.toString('hex')))

// // const d = btc.importPrivatyKey('cT4wDwKrT3R33XfHK5kMZuSphqZxVVDfD5XYszaficiW4mnm36Pg')
// // console.log(btc.toAddress(d.publicKey))
// // console.log(btc.toWIF(d))



