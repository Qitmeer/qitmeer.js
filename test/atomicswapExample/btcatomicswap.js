const bitcoin = require('bitcoinjs-lib')
const randomBytes = require('randombytes')
const { hexToTime, timeToHex } = require('./tools/union')

// This column is based on the BTC test network
const network = bitcoin.networks.testnet

// creat OP map
const coderToOp = (function(){
    const o = {}
    for(let i in bitcoin.opcodes) {
        o[bitcoin.opcodes[i]] = i
    }
    return o
})();

/**
 * Parsing the hex contract
 * @param scriptHex string 
 * @returns { string }
 */
function parsingBufferScrpit( script ) {
    return bitcoin.script.decompile(Buffer(script, 'hex')).map( v => {
        if( typeof v === 'number' ) return coderToOp[v];
        if( v instanceof Buffer ) return v.toString('hex');
    }).join(' ')
}

/**
 * Compile the hex contract
 * @param scriptOp string 
 * @returns { hex }
 */
function compileBufferScrpit( contrStr ) {
    const arr = contrStr.split(' ');
    return bitcoin.script.compile(arr.map( v => {
        if( bitcoin.opcodes[v] ) return bitcoin.opcodes[v];
        else return Buffer(v, 'hex');
    })).toString('hex');
}

function BTCUnit(num) {
    return parseInt( num * 100000000 )
}

/**
 * Create time-lock contract script
 * @param secretHash 
 * @param _redeempublikeyHash Redeem publickey
 * @param _refundPublikeyHash refund publickey
 * @param lockTime 
 * @returns { Array }
 */
function lockTimeOpScript( secretHash, _redeempublikeyHash, _refundPublikeyHash, lockTime ) {
    console.log(lockTime,'lockTime')
    return [
        'OP_IF',
        'OP_RIPEMD160',
        secretHash,
        'OP_EQUALVERIFY',
        'OP_DUP',
        'OP_HASH160',
        _redeempublikeyHash,
        'OP_ELSE',
        lockTime,
        'OP_CHECKLOCKTIMEVERIFY',
        'OP_DROP',
        'OP_DUP',
        'OP_HASH160',
        _refundPublikeyHash,
        'OP_ENDIF',
        'OP_EQUALVERIFY',
        'OP_CHECKSIG'
    ].join(' ')
}

/**
 * Create refund contract script
 * @param sign  refund Address sign
 * @param _refundPublikeyHash refund publickey
 * @param scriptHash
 * @returns { Array }
 */
function refundOpScript( sign, _refundPublikeyHash, scriptHash ) {
    return [
        sign,
        _refundPublikeyHash,
        'OP_0',
        scriptHash
    ].join(' ')
}

/**
 * Create redeem contract script
 * @param sign  redeem Address sign
 * @param _redeemPublikeyHash redeem publickey hash
 * @param secret
 * @param scriptHash
 * @returns { Array }
 */
function redeemOpScript( sign, _redeemPublikeyHash, secret ,scriptHash ) {
    return [
        sign,
        _redeemPublikeyHash,
        secret,
        'OP_1',
        scriptHash
    ].join(' ')
}

/**
 * Create the P2SH address through OPS
 * @param ops string
 * @param networkStr privnet|testnet|mainnet
 * @returns { p2shAddress: < Base58p2shAddress > , contractScript: < hex > }
 */
function creatP2SHAddress( ops ) {
    const output = Buffer( compileBufferScrpit( ops ), 'hex' )
    const p2sh = bitcoin.payments.p2sh({ redeem:{output} , network })
    return {
        p2shAddress: p2sh.address,
        contractScript: output.toString('hex')
    }
}

/**
 * Create redeem contract script
 * @param _wifPrivateKey refund Address PrivateKey
 * @param _refundAddress refund publickey hash
 * @param amount refund HLC num
 * @param locktimeTxid time-lock contract transaction ID
 * @param contractScript time-lock contract script
 * @param lockTime Contract expiry date
 * @returns { Transaction, RefundId }
 */
function creatRefundRaw( { _wifPrivateKey, _refundAddress , amount, locktimeTxid, contractScript, lockTime } ) {
    const keyPair = bitcoin.ECPair.fromWIF(_wifPrivateKey, network)
    const publickey = keyPair.publicKey.toString('hex')
    const txb = new bitcoin.TransactionBuilder(network)
    txb.setLockTime(lockTime)
    txb.addInput( locktimeTxid, 0 );
    txb.__tx.ins[0].sequence = 0
    txb.addOutput( _refundAddress, BTCUnit( amount ) );
    const signScript = txb.__tx.hashForSignature(0, Buffer(contractScript,'hex') , 1)
    const signature = keyPair.sign(signScript) 
    const transactionSign = bitcoin.script.signature.encode(signature, 1)
    const txscript = compileBufferScrpit( refundOpScript( transactionSign.toString('hex'), publickey, contractScript ) )
    txb.__tx.ins[0].script = Buffer(txscript,'hex') 
    return {
        Transaction: txb.__tx.toBuffer().toString('hex'),
        RefundId: txb.__tx.getId()
    }
}

/**
 * Create redeem contract script
 * @param _wifPrivateKeyByRedeemAddress redeem Address PrivateKey
 * @param _redeemAddress redeem Address
 * @param amount redeem HLC num
 * @param locktimeTxid time-lock contract transaction ID
 * @param contractScript time-lock contract script
 * @param lockTime Contract expiry date
 * @param secret
 * @returns { Transaction, RedeemId }
 */
function creatRedeemRaw({ _wifPrivateKeyByRedeemAddress, _redeemAddress, amount, locktimeTxid, contractScript, secret }){
    const keyPair = bitcoin.ECPair.fromWIF(_wifPrivateKeyByRedeemAddress, network)
    const publickey = keyPair.publicKey.toString('hex')
    const txb = new bitcoin.TransactionBuilder(network)
    txb.addInput( locktimeTxid, 0 );
    txb.addOutput( _redeemAddress, BTCUnit( amount ) );
    const signScript = txb.__tx.hashForSignature(0, Buffer(contractScript,'hex') , 1)
    const signature = keyPair.sign(signScript) 
    const transactionSign = bitcoin.script.signature.encode(signature, 1)
    const txscript = compileBufferScrpit( redeemOpScript( transactionSign.toString('hex'), publickey, secret, contractScript ) )
    txb.__tx.ins[0].script = Buffer(txscript,'hex') 
    return {
        Transaction: txb.__tx.toBuffer().toString('hex'),
        RefundId: txb.__tx.getId()
    }
}

/**
 * Create Lock-Time contract
 * @param _redeemAddress redeem Address
 * @param _refundAddress refund publickey hash
 * @param amount refund HLC num
 * @param locktimeTxid time-lock contract transaction ID
 * @param contractScript time-lock contract script
 * @param lockTime Contract expiry date
 */
function creatLockTimecontract( _redeemAddress, _refundAddress, lockTime ) {
    const secret = randomBytes(32).toString('hex');
    const secretHash = bitcoin.crypto.ripemd160( Buffer(secret,'hex') ).toString('hex');
    const _redeemlikeyHash = bitcoin.address.fromBase58Check(_redeemAddress).hash.toString('hex')
    const _refundPublikeyHash = bitcoin.address.fromBase58Check(_refundAddress).hash.toString('hex')
    lockTime = timeToHex( new Date(lockTime) / 1000 );
    const contract = lockTimeOpScript( secretHash, _refundPublikeyHash, _redeemlikeyHash, lockTime );
    const { p2shAddress, contractScript } = creatP2SHAddress(contract)
    return {
        secret,
        secretHash,
        contractScript,
        contractAddress: p2shAddress
    }
}


/**
 * Create Lock-Time contract transaction
 * @param _wifPrivateKey redeem Address
 * @param _locktimeAddress refund publickey hash
 * @param amount refund HLC num
 * @param utxo
 * @param networkStr privnet|testnet|mainnet
 */
function lockTimecontractTransaction ( { _wifPrivateKey, _locktimeAddress, amount, fee, utxo } ) {
    const keyPair = bitcoin.ECPair.fromWIF(_wifPrivateKey, network)
    const p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network })
    const txb = new bitcoin.TransactionBuilder(network)
    let amountAll = 0
    utxo.map( v => {
        const u = v.split(':')
        txb.addInput(u[0], u[1]*1);
        amountAll += (u[2] || 0)*1
    })
    txb.addOutput(_locktimeAddress, BTCUnit( amount ));
    txb.addOutput(p2pkh.address, BTCUnit( amountAll - amount - fee ));
    utxo.map( (v,i) => {
        txb.sign(i, keyPair);
    })
    const transaction = txb.build();
    return {
        transaction: transaction.toBuffer().toString('hex'),
        contractId: transaction.getId()
    }
}

function main() {

    const data = {
        btc: {
            alicePrivateKey: 'cUxDk1doE6b24ecEkTivnQ522F3nf5QUiGdkbWF4CmaAeQrcE9cL',
            aliceAddress: 'myBUMQTmZGK8yKLDranjSQEHbCYCaaywQD',
            bobPrivateKey: 'cNnwSyCLqLNGEbgd9aTWafPaRSpJC9jtffGgJrgfUvfkevepreZG',
            bobAddress: 'n1EDt1Qh58pUT7iiUT8NCNXXJQgLhFCj4C',
            alicerefundAddress: 'myBUMQTmZGK8yKLDranjSQEHbCYCaaywQD', 
            utxo: ['873fa00099abdc5819598642162969408d910674030121efe413e134afd75cf9:1:0.000392'],
            locktime: '2019-5-27 9:00:00',
            fee: 0.000008,
            amount: 0.0001
        }
    }
    const {fee, bobPrivateKey, locktime, amount, alicePrivateKey, aliceAddress, bobAddress, alicerefundAddress, utxo} = data.btc;
    const time = new Date(locktime) / 1000 | 0
    const lockcontract = creatLockTimecontract( data.btc.alicerefundAddress, data.btc.bobAddress, data.btc.locktime );
    const initiatecontract = lockTimecontractTransaction ( {
        _wifPrivateKey: data.btc.alicePrivateKey, 
        _locktimeAddress: lockcontract.contractAddress, 
        amount: data.btc.amount, 
        utxo: data.btc.utxo,
        fee: data.btc.fee
    } ) 

    const {  contractId }  = initiatecontract;

    const refundecontract = creatRefundRaw( {
        _wifPrivateKey: alicePrivateKey, 
        _refundAddress: alicerefundAddress , 
        amount: amount - fee, 
        locktimeTxid: contractId, 
        contractScript: lockcontract.contractScript,
        lockTime: time
    })

    const redeemcontract = creatRedeemRaw( {
        _wifPrivateKeyByRedeemAddress: bobPrivateKey, 
        _redeemAddress: bobAddress, 
        amount: amount - fee, 
        locktimeTxid: contractId, 
        contractScript: lockcontract.contractScript,
        secret: lockcontract.secret
    })

    return {
        refundecontract,
        redeemcontract,
        initiatecontract,
        lockcontract
    }

}

module.exports = {
    refundecontract,
    redeemcontract,
    initiatecontract,
    lockcontract
} = main();
