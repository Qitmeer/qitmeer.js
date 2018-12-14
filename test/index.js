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

// const impoPriv = wallet.importPrivatyKeyHLC('L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC', '1', '1', '1')
// console.log('importPrivatyKeyHLC : ' + JSON.stringify(impoPriv))
// console.log(impoPriv.privateKey.toString('hex'))

// const url = 'http://hlc.api.diabin.com/api/v1/wallet/utxos?address={address}'
// const sendtx = 'http://hlc.api.diabin.com/api/v1/tx/sendrawtx'
// let ajax = require('./../tools/ajax')
// ajax.Get(url, {
//     address: 'RmFa5hnPd3uQRpzr3xWTfr8EFZdX7dS1qzV'
// }, (res) => {
//     const utxos = res.result
//     // console.log(JSON.stringify(utxos))

//     const txsign = wallet.txSignHLC([{
//         "vout": 2,
//         "txid": "a1292305755eb80edbf49cf1a165c5e14c919b82a9c7618e9479a8ad4a298409",
//         "amount": "45000000000"
//     }], impoPriv.privateKey, 'Rm7US8kMw7HSSbNDkJLDdqD9cpzSs5PFdyU', '20', '0.214')
//     console.log(txsign)

//     // ajax.Post(sendtx, {
//     //     'tx': txsign
//     // }, result => {
//     //     console.log(result)
//     // })
// })

// ajax.Get(url, {
//     address: 'Rm7US8kMw7HSSbNDkJLDdqD9cpzSs5PFdyU'
// }, (res) => {
//     const utxos = res.result
//     console.log(JSON.stringify(utxos))
// })



// const wallet = require('../wallet/wallet')

// const hlcCreate = wallet.createBTC('1', '1', '1')

// console.log('createBTC : ' + JSON.stringify(hlcCreate))

// const Enc = wallet.createEncryptBTC(hlcCreate.privateKey, '1', '1', '1')

// console.log('createEncryptBTC : ' + JSON.stringify(Enc))

// const decipher = wallet.decipherPivateKey(Enc.privateKey, '1')
// console.log('decipherPivateKey : ' + decipher)
// const words = wallet.wordsBTC(decipher)
// console.log('wordsBTC : ' + words)

// const impoWords = wallet.importWordsBTC(words, '1', '1', '1')
// console.log('importWordsBTC : ' + JSON.stringify(impoWords))


const impoPriv = wallet.importPrivatyKeyBTC('cT4wDwKrT3R33XfHK5kMZuSphqZxVVDfD5XYszaficiW4mnm36Pg', '1', '1', '1')
console.log('importPrivatyKeyBTC : ' + JSON.stringify(impoPriv))

const url = 'https://test-insight.bitpay.com/api/txs?address={address}&pageNum=0'
const sendtx = 'http://hlc.api.diabin.com/api/v1/tx/sendrawtx'
let ajax = require('./../tools/ajax')

let data = ajax.Get(url, {
    address: impoPriv.address
}, (res) => {
    const txsArr = res.txs,
        utxo = [];
    txsArr.map(v => {
        const vout = v.vout;
        vout.map((v1, i) => {
            if (impoPriv.address === v1.scriptPubKey.addresses[0] && v1.spentTxId === null) {
                utxo.push({
                    txid: v.txid,
                    vout: i,
                    amount: (v1.value * 100000000).toFixed(0)
                });
            }
        })
    });
    console.log(JSON.stringify(utxo))

    const txsign = wallet.txSignBTC(utxo, impoPriv.privateKey, 'mgXMSWuPuunxnzg7ddLKJQ2qMfoQTKB855', '0.01', '0.0001')
    console.log(txsign)

    ajax.Post('https://test-insight.bitpay.com/api/tx/send', {
        rawtx: txsign
    }, (r) => {
        console.log(r)
    })
})