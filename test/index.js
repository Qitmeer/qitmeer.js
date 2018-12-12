// const w = require('./../src----hlc')

// const ecpair = w.ec.fromEntropy()
// ecpair.toWIF()




const wallet = require('../wallet/wallet')

const hlcCreate = wallet.createHLC('1', '1', '1')

console.log('createHLC : ' + JSON.stringify(hlcCreate))

const Enc = wallet.createEncryptHLC(hlcCreate.privateKey, '1', '1', '1')

console.log('createEncryptHLC : ' + JSON.stringify(Enc))

const decipher = wallet.decipherPivateKey(Enc.privateKey, '1')
console.log('decipherPivateKey : ' + decipher)
const words = wallet.wordsHLC(decipher)
console.log('wordsHLC : ' + words)

const impoPriv = wallet.importPrivatyKeyHLC(decipher, '1', '1', '1')
console.log('importPrivatyKeyHLC : ' + JSON.stringify(impoPriv))

const impoWords = wallet.importWordsHLC(words, '1', '1', '1')
console.log('importWordsHLC : ' + JSON.stringify(impoWords))





// const wallet = require('../wallet/wallet')

// const hlcCreate = wallet.createBTC('1', '1', '1')

// console.log('createBTC : ' + JSON.stringify(hlcCreate))

// const Enc = wallet.createEncryptBTC(hlcCreate.privateKey, '1', '1', '1')

// console.log('createEncryptBTC : ' + JSON.stringify(Enc))

// const decipher = wallet.decipherPivateKey(Enc.privateKey, '1')
// console.log('decipherPivateKey : ' + decipher)
// const words = wallet.wordsBTC(decipher)
// console.log('wordsBTC : ' + words)

// const impoPriv = wallet.importPrivatyKeyBTC(decipher, '1', '1', '1')
// console.log('importPrivatyKeyBTC : ' + JSON.stringify(impoPriv))

// const impoWords = wallet.importWordsBTC(words, '1', '1', '1')
// console.log('importWordsBTC : ' + JSON.stringify(impoWords))


