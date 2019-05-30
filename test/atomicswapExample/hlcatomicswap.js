var qitmeerJs = require('../../src')
var { hexToTime, timeToHex } = require('./tools/union')
var randomBytes = require('randombytes')

/**
 * @param num number
 * @returns { number }
 */
function HLCunit( num ) {
    return parseInt(num * 100000000)
}

/**
 * Create the P2SH address through OPS
 * @param ops string
 * @param networkStr privnet|testnet|mainnet
 * @returns { p2shAddress: < Base58p2shAddress > , contractScript: < hex > }
 */
function creatP2SHAddress( ops, networkStr = 'privnet' ) {
    const contractScript = qitmeerJs.script.fromAsm(ops).toBuffer()
    const hash160 = qitmeerJs.hash.hash160(contractScript)
    const network = qitmeerJs.networks[ networkStr ]
    if ( network === undefined ) throw new Error( networkStr + ' is not network')
    const p2shAddress = qitmeerJs.address.toBase58Check(hash160, network.ScriptHashAddrID)
    return {
        p2shAddress,
        contractScript: contractScript.toString('hex')
    }
}

/**
 * Parsing the hex contract
 * @param scriptHex string 
 * @returns { buffer }
 */
function parsingBufferScrpit( scriptHex ) {
    return qitmeerJs.script.fromBuffer(Buffer(scriptHex,'hex')).toAsm();
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
    const keyPair = qitmeerJs.ec.fromWIF(_wifPrivateKey);
    const publickey = keyPair.publicKey.toString('hex')
    const txb = qitmeerJs.txsign.newSigner(); 
    txb.setLockTime(lockTime)
    txb.addInput( locktimeTxid, 0 ,{
        prevOutScript: qitmeerJs.script.fromBuffer(Buffer(contractScript,'hex')),
        sequence: 0
    });
    txb.addOutput( _refundAddress, HLCunit( amount ) );
    txb.sign(0, keyPair);
    const transactionSign = txb.__inputs[0].signature.toString('hex');
    txb.__tx.vin[0].script = qitmeerJs.script.fromAsm(refundOpScript( transactionSign, publickey, contractScript )).toBuffer()
    const newTransaction = txb.__tx.clone();
    return {
        Transaction: newTransaction.toBuffer().toString('hex'),
        RefundId: txb.getId()
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
    const keyPair = qitmeerJs.ec.fromWIF(_wifPrivateKeyByRedeemAddress);
    const publickey = keyPair.publicKey.toString('hex')
    const txb = qitmeerJs.txsign.newSigner(); 
    txb.addInput( locktimeTxid, 0 ,{
        prevOutScript:qitmeerJs.script.fromBuffer(Buffer(contractScript,'hex'))
    });
    txb.addOutput( _redeemAddress, HLCunit( amount ) );
    txb.sign(0, keyPair);
    const transactionSign = txb.__inputs[0].signature.toString('hex');
    txb.__tx.vin[0].script = qitmeerJs.script.fromAsm(redeemOpScript( transactionSign, publickey, secret, contractScript )).toBuffer()
    const newTransaction = txb.__tx.clone();
    return {
        Transaction: newTransaction.toBuffer().toString('hex'),
        RedeemId: txb.getId()
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
    const secretHash = qitmeerJs.hash.ripemd160( Buffer(secret, 'hex')).toString('hex');
    const _redeemlikeyHash = qitmeerJs.address.fromBase58Check(_redeemAddress).hash.toString('hex')
    const _refundPublikeyHash = qitmeerJs.address.fromBase58Check(_refundAddress).hash.toString('hex')
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
function lockTimecontractTransaction ( {_wifPrivateKey, _locktimeAddress, amount, utxo, networkStr = 'privnet'} ) {
    const keyPair = qitmeerJs.ec.fromWIF(_wifPrivateKey);
    const hash160 = qitmeerJs.hash.hash160(keyPair.publicKey)
    const network = qitmeerJs.networks[ networkStr ]
    if ( network === undefined ) throw new Error( networkStr + ' is not network')
    const p2pkhAddress = qitmeerJs.address.toBase58Check(hash160, network.pubKeyHashAddrId)
    const txb = qitmeerJs.txsign.newSigner();
    utxo.map( v => {
        const u = v.split(':')
        txb.addInput(u[0], u[1]*1);
    })
    txb.addOutput(_locktimeAddress, HLCunit( amount - 0.0001 ));
    txb.addOutput(p2pkhAddress, HLCunit( 450 - amount ));
    utxo.map( (v,i) => {
        txb.sign(i, keyPair);
    })
    const transaction = txb.build()
    return {
        transaction: transaction.toBuffer().toString('hex'),
        contractId: txb.getId()
    }
}

function creatLocktimeTrand() {
    /**
     * atomicswap-cli test
     * @param lockTime Contract expiry date
     * @param _wifPrivateKey HLC holds the private key
     * @param _wifPrivateKeyByRedeemAddress HLC receives the private key 
     * @param _refundAddress Refund address
     * @param _redeemAddress Redeem address
     * @param amount Send HLC amount
     * @param fee Miners fee
     * @param utxo 
     */
    
    const lockTime = '2019.5.25 9:00:00'
    const _wifPrivateKey = 'L4bEH6dwo2tkuD8yN3uoR5ZxQ1kNzdJneEVHV5nYhevAPfjGzsea'
    const _wifPrivateKeyByRedeemAddress = 'KxRwz4CVQGg15ADMmAePDLtWoDWtXheCbd8DCSE9yp1kQBfBhuun'
    const _refundAddress = 'RmCYoUMqKZopUkai2YhUFHR9UeqjeyjTAgW'
    const _redeemAddress = 'RmRYWLhtA3dkgd3vF3bEqZvsriTufMFPBRK'
    const amount = 1
    const fee = 0.0001
    const utxo = ['8d8368f72733ed1607741902dcf54f6342e98bc0dce2fe56fe24bb6f8d9c5ba2:2']

    const lockcontract = creatLockTimecontract( _refundAddress, _redeemAddress, lockTime );
    const initiatecontract = lockTimecontractTransaction ( {
        _wifPrivateKey, 
        _locktimeAddress: lockcontract.contractAddress, 
        amount, 
        utxo
    } ) 

    const {  contractId }  = initiatecontract;

    const refundecontract = creatRefundRaw( {
        _wifPrivateKey, 
        _refundAddress , 
        amount: amount - fee*2, 
        locktimeTxid: contractId, 
        contractScript: lockcontract.contractScript,
        lockTime: new Date(lockTime) / 1000 | 0
    })

    const redeemcontract = creatRedeemRaw( {
        _wifPrivateKeyByRedeemAddress, 
        _redeemAddress, 
        amount: amount - fee*2, 
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
} = creatLocktimeTrand();