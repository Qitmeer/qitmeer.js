// const w = require('./../src----hlc')

// const ecpair = w.ec.fromEntropy()
// ecpair.toWIF()




const wallet = require('../wallet/wallet')

// const hlcCreate = wallet.createHLC('1', '1', '1')

// console.log('createHLC : ' + JSON.stringify(hlcCreate))

// const Enc = wallet.createEncryptHLC(hlcCreate.privateKey, '1', '1', '1')

// console.log('createEncryptHLC : ' + JSON.stringify(Enc))

// const decipher = wallet.decipherPivateKey(Enc.privateKey, '1')
// console.log('decipherPivateKey : ' + decipher)
// const words = wallet.wordsHLC(decipher)
// console.log('wordsHLC : ' + words)

// const impoWords = wallet.importWordsHLC(words, '1', '1', '1')
// console.log('importWordsHLC : ' + JSON.stringify(impoWords))

const impoPriv = wallet.importPrivatyKeyHLC('L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC', '1', '1', '1')
console.log('importPrivatyKeyHLC : ' + JSON.stringify(impoPriv))

const url = 'http://hlc.api.diabin.com/api/v1/wallet/utxos?address={address}'
const sendtx = 'http://hlc.api.diabin.com/api/v1/tx/sendrawtx'
let ajax = require('./../tools/ajax')
ajax.Get(url, {
    address: 'RmFa5hnPd3uQRpzr3xWTfr8EFZdX7dS1qzV'
}, (res) => {
    const utxos = res.result
    // console.log(JSON.stringify(utxos))

    const txsign = wallet.txSignHLC(utxos, impoPriv.privateKey, 'Rm7US8kMw7HSSbNDkJLDdqD9cpzSs5PFdyU', '10', '0.214')
    console.log(txsign)

    ajax.Post(sendtx, {
        'tx': txsign
    }, result => {
        console.log(result)
    })
})


ajax.Get(url, {
    address: 'Rm7US8kMw7HSSbNDkJLDdqD9cpzSs5PFdyU'
}, (res) => {
    const utxos = res.result
    console.log(JSON.stringify(utxos))



})



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